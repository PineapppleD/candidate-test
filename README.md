## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** версии 16+
- **PostgreSQL** 12+ 
- **Git** 

### 1. Клонирование репозитория

```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd candidate-tester
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных

#### Создайте базу данных PostgreSQL:

```sql
-- Подключитесь к PostgreSQL и выполните:
CREATE DATABASE candidate_test;
```

#### Настройте переменные окружения:

Создайте файл `.env` в корне проекта:

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=candidate_test
DB_USER=postgres
DB_PASSWORD=your_password

# Сервер
PORT=3000
NODE_ENV=development
```

#### Создайте тестовую таблицу:

```sql
-- Выполните в вашей базе данных:
CREATE SEQUENCE auto_cat1__id;

CREATE TABLE public.cat1__nomenclature (
	cat1__id int4 DEFAULT nextval('auto_cat1__id'::regclass) NOT NULL,
	cat1__uuid uuid DEFAULT uuid_generate_v4() NOT NULL,
	cat1__insertdate timestamptz DEFAULT now() NOT NULL,
	cat1__updatedate timestamptz DEFAULT now() NOT NULL,
	cat1__deleted bool DEFAULT false NOT NULL,
	cat1__deletedate timestamptz NULL,
	cat1__isfolder bool DEFAULT false NOT NULL,
	cat1_cat1__folder uuid NULL,
	cat1__code text NULL,
	cat1__represent text NOT NULL,
	CONSTRAINT cat1__nomenclature_cat19__code_key UNIQUE (cat1__code),
	CONSTRAINT cat1__nomenclature_pkey PRIMARY KEY (cat1__uuid),
	CONSTRAINT cat1__nomenclature_cat1_cat1__folder_fkey FOREIGN KEY (cat1_cat1__folder) REFERENCES public.cat1__nomenclature(cat1__uuid)
);


-- Добавьте тестовые данные:
INSERT INTO cat1__nomenclature (cat1__code, cat1__represent) VALUES 
('ITEM001', 'Первый товар'),
('ITEM002', 'Второй товар'),
('ITEM003', 'Третий товар');
```

### 4. Запуск приложения

```bash
npm start
```

Приложение будет доступно по адресу: **http://localhost:3000**

## 📁 Структура проекта

```
candidate-tester/
├── backend/                 # Серверная часть
│   ├── classes/            # Классы для работы с данными
│   │   ├── SVInstance.js   # CRUD операции для экземпляров
│   │   └── SVList.js       # Получение списков
│   ├── controllers/        # Контроллеры
│   │   ├── api.js          # API endpoints
│   │   ├── mainController.js # Основной контроллер
│   │   └── Metadata.js     # Управление метаданными
│   ├── db/                 # База данных
│   │   └── pg.js           # Подключение к PostgreSQL
│   ├── utils/              # Утилиты
│   ├── router.js           # Маршрутизация
│   └── server.js           # Главный файл сервера
├── frontend/               # Клиентская часть
│   ├── css/               # Стили
│   ├── js/                # JavaScript
│   │   └── main.js        # Основная логика фронтенда
│   ├── items/             # Динамические страницы
│   │   └── page1.js       # Пример дополнительной страницы
│   └── index.html         # Главная HTML страница
├── package.json           # Зависимости и скрипты
└── README.md             # Документация
```
## 🔧 Архитектура:

- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** Vanilla JavaScript (ES6+ классы)
- **API:** REST endpoints для CRUD операций
- **Паттерны:** MVC, класс-ориентированный подход
