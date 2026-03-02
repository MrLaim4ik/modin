const modsData = [
    { name: "Better Animals Plus", cat: "nature", ver: "1.20.1 • Forge", img: "https://media.forgecdn.net/attachments/324/563/637424608670155099.png", desc: "Огромное обновление фауны: от оленей до медведей." },
    { name: "Create Mod", cat: "tech", ver: "1.19.2 • Fabric", img: "https://media.forgecdn.net/attachments/315/802/637372481710953331.png", desc: "Инженерный мод с красивыми анимациями вращения." },
    { name: "Biomes O' Plenty", cat: "nature", ver: "1.20.1 • Forge", img: "https://media.forgecdn.net/attachments/265/224/636998462002347313.png", desc: "Добавляет более 80 новых биомов в игру." },
    { name: "Thaumcraft", cat: "magic", ver: "1.12.2 • Forge", img: "https://media.forgecdn.net/attachments/240/123/63692345634567.png", desc: "Классика магических модов: аспекты и палочки." },
    { name: "Twilight Forest", cat: "nature", ver: "1.20.1 • Forge", img: "https://media.forgecdn.net/attachments/260/767/636982440188647037.png", desc: "Мир вечных сумерек и огромных данжей." },
    { name: "Applied Energistics 2", cat: "tech", ver: "1.20.1 • Forge", img: "https://media.forgecdn.net/attachments/280/500/6371000000.png", desc: "Цифровое хранение ресурсов в МЭ-сети." },
    { name: "Botania", cat: "magic", ver: "1.19.2 • Fabric", img: "https://media.forgecdn.net/attachments/270/110/6370123456789.png", desc: "Технический мод, прикидывающийся магией цветов." },
    { name: "JourneyMap", cat: "tech", ver: "1.20.1 • Forge", img: "https://media.forgecdn.net/attachments/24/76/635398282361285038.png", desc: "Лучшая мини-карта для исследования мира." }
];

const grid = document.getElementById('grid');
const loader = document.getElementById('loader');

function render(filter = 'all') {
    grid.innerHTML = '';
    loader.style.display = 'flex'; // Показываем лоадер

    // Имитируем загрузку (полсекунды)
    setTimeout(() => {
        loader.style.display = 'none';
        
        // Заполняем сетку (удваиваем данные для массы)
        const list = [...modsData, ...modsData];
        list.forEach(m => {
            if(filter !== 'all' && m.cat !== filter) return;
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="img-box"><img src="${m.img}" onerror="this.src='https://via.placeholder.com/240x150?text=No+Image'"></div>
                <div class="card-info">
                    <b>${m.name}</b>
                    <small>${m.ver}</small>
                </div>
            `;
            card.onclick = () => openMod(m);
            grid.appendChild(card);
        });
    }, 500);
}

function openMod(m) {
    document.getElementById('m-name').innerText = m.name;
    document.getElementById('m-desc').innerText = m.desc;
    document.getElementById('m-banner').style.backgroundImage = `url(${m.img})`;
    document.getElementById('modModal').classList.add('open');
}
function openProfile() {
    document.getElementById('profileModal').classList.add('open');
    // Закрываем блюр, если нужно, или добавляем его
    document.body.classList.add('active-modal');
}

function openProfile() { document.getElementById('profileModal').classList.add('open'); }

function saveProfile() {
    let skin = document.getElementById('userSkinInput').value || 'steve';
    document.getElementById('userAvatar').style.backgroundImage = `url(https://mc-heads.net/avatar/${skin}/100)`;
    document.getElementById('profileModal').classList.remove('open');
}

// Фильтры
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.cat);
    };
});

// Закрытие окон
window.onclick = (e) => {
    if(e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
    }
};// Поиск модов на Modrinth
async function searchModrinth() {
    const query = document.getElementById('search').value;
    if (!query) return;

    loader.style.display = 'flex';
    grid.innerHTML = '';

    try {
        const response = await fetch(`/search_mods?search=${query}`);
        const data = await response.json();
        
        loader.style.display = 'none';

        data.hits.forEach(mod => {
            const card = document.createElement('div');
            card.className = 'card';
            // У Modrinth картинка лежит в поле icon_url
            card.innerHTML = `
                <div class="img-box">
                    <img src="${mod.icon_url || 'https://via.placeholder.com/240x150?text=No+Icon'}" onerror="this.src='https://via.placeholder.com/240x150'">
                </div>
                <div class="card-info">
                    <b>${mod.title}</b>
                    <small>Автор: ${mod.author}</small>
                </div>
            `;
            // Передаем mod_id (у Modrinth это поле project_id или просто id)
            card.onclick = () => openModDetails(mod);
            grid.appendChild(card);
        });
    } catch (e) {
        console.error("Ошибка поиска:", e);
        loader.style.display = 'none';
    }
}

// Открытие модального окна
async function openModDetails(mod) {
    document.getElementById('m-name').innerText = mod.title;
    document.getElementById('m-desc').innerText = mod.description;
    document.getElementById('m-banner').style.backgroundImage = `url(${mod.icon_url || ''})`;
    
    const installBtn = document.querySelector('.btn-install');
    installBtn.innerText = "СКАЧАТЬ .JAR";
    
    installBtn.onclick = async () => {
        installBtn.innerText = "⏳ ПОЛУЧАЕМ ФАЙЛ...";
        
        // Запрашиваем прямую ссылку на файл через наш сервер
        // mod.project_id — это уникальный ID в результатах поиска Modrinth
        const res = await fetch(`/get_mod_files/${mod.project_id.replace('local-', '')}`);
        const fileData = await res.json();
        
        if (fileData.downloadUrl) {
            // Создаем скрытую ссылку для скачивания в браузере
            const a = document.createElement('a');
            a.href = fileData.downloadUrl;
            a.download = fileData.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            installBtn.innerText = "✅ СКАЧИВАНИЕ НАЧАТО";
            setTimeout(() => installBtn.innerText = "СКАЧАТЬ ЕЩЕ РАЗ", 3000);
        } else {
            alert("Не удалось найти файл для загрузки");
            installBtn.innerText = "ОШИБКА";
        }
    };

    document.getElementById('modModal').classList.add('open');
}
// Массив для хранения имен установленных модов
let installedMods = JSON.parse(localStorage.getItem('myInstalledMods')) || [];

function render(filter = 'all') {
    grid.innerHTML = '';
    loader.style.display = 'flex';

    setTimeout(() => {
        loader.style.display = 'none';
        
        // Если выбран фильтр "installed", берем только те, что в массиве
        let list = modsData;
        if (filter === 'installed') {
            list = modsData.filter(m => installedMods.includes(m.name));
            if (list.length === 0) {
                grid.innerHTML = '<p style="color: #666; grid-column: 1/-1; text-align: center; margin-top: 50px;">Вы еще ничего не установили...</p>';
                return;
            }
        } else if (filter !== 'all') {
            list = modsData.filter(m => m.cat === filter);
        }

        list.forEach((m, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            // Добавляем небольшую задержку анимации программно
            card.style.animationDelay = `${index * 0.05}s`;
            
            card.innerHTML = `
                <div class="img-box"><img src="${m.img}"></div>
                <div class="card-info">
                    <b>${m.name}</b>
                    <small>${m.ver} ${installedMods.includes(m.name) ? '✅' : ''}</small>
                </div>
            `;
            card.onclick = () => openMod(m);
            grid.appendChild(card);
        });
    }, 400);
}

function openMod(m) {
    const modal = document.getElementById('modModal');
    const installBtn = modal.querySelector('.btn-install');
    
    document.getElementById('m-name').innerText = m.name;
    document.getElementById('m-desc').innerText = m.desc;
    document.getElementById('m-banner').style.backgroundImage = `url(${m.img})`;
    
    // Меняем текст кнопки в зависимости от того, установлен мод или нет
    if (installedMods.includes(m.name)) {
        installBtn.innerText = "УДАЛИТЬ МОД";
        installBtn.classList.add('btn-installed');
        installBtn.onclick = () => toggleInstall(m.name);
    } else {
        installBtn.innerText = "УСТАНОВИТЬ";
        installBtn.classList.remove('btn-installed');
        installBtn.onclick = () => toggleInstall(m.name);
    }
    
    modal.classList.add('open');
}

function toggleInstall(modName) {
    if (installedMods.includes(modName)) {
        // Удаляем
        installedMods = installedMods.filter(name => name !== modName);
    } else {
        // Добавляем
        installedMods.push(modName);
    }
    
    // Сохраняем в память браузера (чтобы после перезагрузки не пропало)
    localStorage.setItem('myInstalledMods', JSON.stringify(installedMods));
    
    // Закрываем модалку и обновляем список
    document.getElementById('modModal').classList.remove('open');
    render(document.querySelector('.filter-btn.active').dataset.cat);
}
// Функция поиска (вызывай её при нажатии Enter в поиске)
async function performSearch() {
    const query = document.getElementById('search').value;
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    
    displayMods(data.hits); // Твоя функция отрисовки карточек
}

// Функция внутри модального окна для скачивания
async function downloadMod(projectId) {
    const btn = document.querySelector('.btn-install');
    btn.innerText = "⏳ ПОЛУЧЕНИЕ ССЫЛКИ...";

    try {
        const response = await fetch(`/api/download/${projectId}`);
        const data = await response.json();

        if (data.url) {
            // Создаем временную ссылку для браузера
            const link = document.createElement('a');
            link.href = data.url;
            link.download = data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            btn.innerText = "✅ ГОТОВО";
        }
    } catch (error) {
        btn.innerText = "❌ ОШИБКА";
        console.error("Ошибка API Modrinth:", error);
    }
}
// Функция для отрисовки модов (универсальная)
function displayMods(mods, isModrinth = false) {
    const grid = document.getElementById('grid'); // Убедись, что ID совпадает
    grid.innerHTML = ''; // Очищаем старые карточки

    mods.forEach((m, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.05}s`;

        // Данные от Modrinth и локальные данные имеют разные поля
        const name = isModrinth ? m.title : m.name;
        const img = isModrinth ? (m.icon_url || 'https://via.placeholder.com/240x150') : m.img;
        const author = isModrinth ? `Автор: ${m.author}` : m.ver;
        const id = isModrinth ? m.project_id : m.name;

        card.innerHTML = `
            <div class="img-box">
                <img src="${img}" onerror="this.src='https://via.placeholder.com/240x150'">
            </div>
            <div class="card-info">
                <b>${name}</b>
                <small>${author}</small>
            </div>
        `;

        // При клике открываем детали
        card.onclick = () => isModrinth ? openModrinthDetails(m) : openMod(m);
        grid.appendChild(card);
    });
}

// Новая функция поиска, которую нужно привязать к инпуту
async function handleSearch() {
    const query = document.getElementById('search').value;
    if (query.length < 3) return; // Не ищем, если меньше 3 символов

    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        loader.style.display = 'none';
        
        if (data.hits) {
            displayMods(data.hits, true); // Рисуем моды из Modrinth
        }
    } catch (err) {
        console.error("Ошибка поиска:", err);
        loader.style.display = 'none';
    }
}

// Привязываем поиск к клавише Enter в поле ввода
document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
render();