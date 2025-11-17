// main.js - Главный файл и главная страница
import ModalManager from './managers/ModalManager.js';
import NomenclatureManager from './managers/NomenclatureManager.js';
import IndividualsManager from './managers/IndividualsManager.js';
import StaffersManager from './managers/StaffersManager.js';

// Массив для хранения загруженных скриптов
let loadedScripts = [];

// Глобальные экземпляры
let modalManager;
let nomenclatureManager;
let individualsManager;
let staffersManager;

// Функция для динамической загрузки JS файлов из папки items
async function loadPageScript(pageName) {
  const scriptPath = `items/${pageName}.js`;

  return new Promise((resolve, reject) => {
    if (loadedScripts.includes(scriptPath)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = scriptPath;
    script.onload = () => {
      loadedScripts.push(scriptPath);
      console.log(`Загружен скрипт страницы: ${scriptPath}`);
      resolve();
    };
    script.onerror = () => {
      console.error(`Ошибка загрузки скрипта: ${scriptPath}`);
      reject(new Error(`Не удалось загрузить ${scriptPath}`));
    };
    document.head.appendChild(script);
  });
}

// Функция для очистки контейнера приложения
function clearApp() {
  const app = document.getElementById('app');
  app.innerHTML = '';
}

// Главная страница
async function createHomePage() {
  clearApp();
  const app = document.getElementById('app');

  const homeContainer = document.createElement('div');
  homeContainer.className = 'home-page';

  const title = document.createElement('h2');
  title.textContent = 'Главная страница';
  title.style.color = '#28a745';
  title.style.marginBottom = '20px';

  const description = document.createElement('p');
  description.textContent = 'Добро пожаловать! Кликните на строку в таблице для редактирования';
  description.style.marginBottom = '20px';

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'nomenclature-container';

  homeContainer.appendChild(title);
  homeContainer.appendChild(description);
  homeContainer.appendChild(loadingDiv);
  app.appendChild(homeContainer);

  // Инициализируем менеджеры
  modalManager = new ModalManager();
  nomenclatureManager = new NomenclatureManager();
  modalManager.currentManager = nomenclatureManager; 
  await nomenclatureManager.init('nomenclature-container', modalManager);
}

// Страница физических лиц
async function createIndividualsPage() {
  clearApp();
  const app = document.getElementById('app');

  const container = document.createElement('div');
  container.className = 'individuals-page';

  const title = document.createElement('h2');
  title.textContent = 'Физические лица';
  title.style.color = '#007bff';
  title.style.marginBottom = '20px';

  const description = document.createElement('p');
  description.textContent = 'Управление физическими лицами: добавление, редактирование, поиск по ИИН';
  description.style.marginBottom = '20px';

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'individuals-container';

  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(loadingDiv);
  app.appendChild(container);

  // Инициализируем менеджеры
  modalManager = new ModalManager();
  individualsManager = new IndividualsManager();
  modalManager.currentManager = individualsManager;
  await individualsManager.init('individuals-container', modalManager);
}

// Страница сотрудников
async function createStaffersPage() {
  clearApp();
  const app = document.getElementById('app');

  const container = document.createElement('div');
  container.className = 'staffers-page';

  const title = document.createElement('h2');
  title.textContent = 'Сотрудники';
  title.style.color = '#6f42c1';
  title.style.marginBottom = '20px';

  const description = document.createElement('p');
  description.textContent = 'Управление сотрудниками: табельные номера, связь с физическими лицами';
  description.style.marginBottom = '20px';

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'staffers-container';

  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(loadingDiv);
  app.appendChild(container);

  // Инициализируем менеджеры
  modalManager = new ModalManager();
  staffersManager = new StaffersManager();
  modalManager.currentManager = staffersManager;
  await staffersManager.init('staffers-container', modalManager);
}

// Универсальная функция для загрузки и создания страниц
async function loadAndCreatePage(pageName, createFunctionName) {
  clearApp();
  const app = document.getElementById('app');

  const loadingDiv = document.createElement('div');
  loadingDiv.textContent = `Загрузка ${pageName}...`;
  loadingDiv.style.cssText = 'padding: 20px; text-align: center; color: #666;';
  app.appendChild(loadingDiv);

  try {
    await loadPageScript(pageName);
    app.removeChild(loadingDiv);

    if (typeof window[createFunctionName] === 'function') {
      const pageElement = await window[createFunctionName]();
      app.appendChild(pageElement);
    } else {
      throw new Error(`Функция ${createFunctionName} не найдена`);
    }

  } catch (error) {
    app.innerHTML = `<p style="color: red;">Ошибка загрузки страницы: ${error.message}</p>`;
    console.error('Ошибка загрузки страницы:', error);
  }
}

// Роутинг
const routes = {
  home: async () => {
    await createHomePage();
  },
  individuals: async () => {
    await createIndividualsPage();
  },
  staffers: async () => {
    await createStaffersPage();
  },
  page1: async () => {
    await loadAndCreatePage('page1', 'createPage1');
  }
};

// Функция рендеринга
async function render() {
  const hash = location.hash.replace('#', '') || 'home';

  if (routes[hash]) {
    await routes[hash]();
  } else {
    clearApp();
    const app = document.getElementById('app');
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = '<h2>404</h2><p>Страница не найдена</p>';
    errorDiv.style.cssText = 'text-align: center; padding: 40px; color: #666;';
    app.appendChild(errorDiv);
  }
}

// Инициализация
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);