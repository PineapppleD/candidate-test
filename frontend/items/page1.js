// items/page1.js
console.log('Page 1 loaded');

async function createPage1() {
  // Симуляция async инициализации
  console.log('Инициализация Page 1...');
  await new Promise(resolve => setTimeout(resolve, 300)); // Симуляция загрузки
  
  // Создаем главный контейнер для страницы
  const pageContainer = document.createElement('div');
  pageContainer.className = 'page-container';
  
  // Заголовок страницы
  const title = document.createElement('h2');
  title.textContent = 'Page 1 - Динамическая страница';
  title.style.color = '#007bff';
  title.style.marginBottom = '20px';
  
  // Описание
  const description = document.createElement('p');
  description.textContent = 'Эта страница создана динамически через appendChild в JS файле из папки items/';
  description.style.marginBottom = '20px';
  
  // Контейнер для интерактивных элементов
  const contentBox = document.createElement('div');
  contentBox.style.cssText = `
    border: 2px solid #007bff;
    padding: 20px;
    border-radius: 8px;
    background: #f8f9fa;
    margin: 20px 0;
  `;
  
  // Кнопка
  const button = document.createElement('button');
  button.textContent = 'Нажмите меня!';
  button.style.cssText = `
    background: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
  `;
  
  // Поле вывода
  const output = document.createElement('div');
  output.id = 'page1-output';
  output.style.cssText = `
    margin-top: 15px;
    padding: 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 50px;
  `;
  output.innerHTML = '<em>Результат появится здесь...</em>';
  
  // Async обработчик события для кнопки
  button.addEventListener('click', async () => {
    output.innerHTML = '<em>Обработка...</em>';
    
    // Симуляция async операции
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    output.innerHTML = `
      <strong>Страница активна!</strong><br>
      Время клика: ${now.toLocaleTimeString()}<br>
      Дата: ${now.toLocaleDateString()}<br>
      <small>Обработано асинхронно</small>
    `;
  });
  
  // Async загрузка дополнительных данных
  const dataSection = await loadPage1Data();
  
  // Дополнительная информация
  const infoBox = document.createElement('div');
  infoBox.style.cssText = `
    margin-top: 20px;
    padding: 15px;
    background: #e9ecef;
    border-left: 4px solid #007bff;
    border-radius: 0 4px 4px 0;
  `;
  infoBox.innerHTML = `
    <strong>Информация:</strong><br>
    • Файл: frontend/items/page1.js<br>
    • Метод: async/await + appendChild<br>
    • Создано: ${new Date().toLocaleString()}<br>
    • Инициализация: асинхронная
  `;
  
  // Собираем все элементы
  contentBox.appendChild(button);
  contentBox.appendChild(output);
  
  pageContainer.appendChild(title);
  pageContainer.appendChild(description);
  pageContainer.appendChild(contentBox);
  pageContainer.appendChild(dataSection);
  pageContainer.appendChild(infoBox);
  
  console.log('Page 1 инициализирована');
  return pageContainer;
}

// Async функция для загрузки данных страницы
async function loadPage1Data() {
  console.log('Загрузка данных Page 1...');
  
  // Симуляция загрузки данных с сервера
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const dataContainer = document.createElement('div');
  dataContainer.style.cssText = `
    margin: 20px 0;
    padding: 15px;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
  `;
  
  const dataTitle = document.createElement('h4');
  dataTitle.textContent = 'Асинхронно загруженные данные:';
  dataTitle.style.color = '#155724';
  dataTitle.style.marginBottom = '10px';
  
  const dataList = document.createElement('ul');
  dataList.style.margin = '0';
  
  const mockData = [
    'Данные успешно загружены',
    'Время загрузки: 800ms',
    'Статус: Активен',
    'Тип инициализации: Async/Await'
  ];
  
  mockData.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    listItem.style.marginBottom = '5px';
    dataList.appendChild(listItem);
  });
  
  dataContainer.appendChild(dataTitle);
  dataContainer.appendChild(dataList);
  
  return dataContainer;
}

// Экспортируем async функцию создания страницы
window.createPage1 = createPage1; 