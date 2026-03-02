from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import os
import requests
from flask import Flask, jsonify, request

app = Flask(__name__)
app.secret_key = 'launcher_secret_key' # Ключ для защиты сессий

# Рекомендация из документации Modrinth: укажите понятный User-Agent
HEADERS = {
    'User-Agent': 'MyModLauncher/1.0.0 (contact@example.com)'
}

@app.route('/api/search')
def search_modrinth():
    query = request.args.get('q', '')
    # Фильтруем только моды (project_type:mod)
    url = f"https://api.modrinth.com/v2/search?query={query}&facets=[[\"project_type:mod\"]]"
    
    response = requests.get(url, headers=HEADERS)
    return jsonify(response.json())

@app.route('/api/download/<project_id>')
def get_download_link(project_id):
    # Получаем список всех версий этого мода
    url = f"https://api.modrinth.com/v2/project/{project_id}/version"
    response = requests.get(url, headers=HEADERS)
    versions = response.json()
    
    if versions:
        # Берем самую последнюю версию и её первый файл
        latest = versions[0]
        file_data = latest['files'][0]
        return jsonify({
            'url': file_data['url'],
            'filename': file_data['filename']
        })
    return jsonify({'error': 'No files found'}), 404

# Создание базы данных при запуске
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            skin TEXT DEFAULT 'steve'
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    # Если пользователь не вошел, отправляем на логин
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('index.html', user=session['user'], skin=session['skin'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            session['user'] = user[1]
            session['skin'] = user[1] # Используем ник как скин по умолчанию
            return redirect(url_for('index'))
        return "Ошибка: Неверные данные!"
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        try:
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
            conn.commit()
            conn.close()
            return redirect(url_for('login'))
        except:
            return "Ошибка: Такой пользователь уже есть!"
    return render_template('register.html')
@app.route('/logout')
def logout():
    session.clear()  # Очищаем все данные (логин, скин и т.д.)
    return redirect(url_for('login'))  # Отправляем обратно на страницу входа

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False)