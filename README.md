# Домашнее задание «8. EventSource, Websockets» — Чат

![Netology AHJ](https://github.com/jusnd/ahj-sse-ws-chat/actions/workflows/web.yml/badge.svg)

**GitHub Pages:** https://jusnd.github.io/ahj-sse-ws-chat/

Клиентская часть корпоративного чата на WebSocket + серверная часть (Express + ws) для деплоя на Render.

## Функциональность

- При загрузке страницы — модальное окно с запросом никнейма (регистрация через `POST /new-user`).
- Если никнейм занят — показывается сообщение об ошибке, можно выбрать другой.
- После регистрации открывается окно чата:
  - слева — список участников (себя видно как `You`);
  - сообщения других участников выравниваются по левому краю, свои — по правому;
  - при отключении пользователя он удаляется из списка участников.
- Обмен сообщениями через WebSocket (`type: "send"` / `type: "exit"`).

## Структура

```
├── src/                  # клиент (Webpack-сборка)
│   ├── index.html
│   ├── index.js
│   ├── css/style.css
│   └── js/
│       ├── ChatApi.js    # REST + WebSocket API
│       └── Chat.js       # логика интерфейса
├── backend/              # сервер Netology (Express + ws) для Render
├── .github/workflows/    # автодеплой на GitHub Pages
└── webpack.*.js          # конфигурация сборки
```

## Запуск локально

Требуется Node.js 16–21 (для backend) и npm.

1. Установить зависимости и запустить сервер:

```bash
cd backend
npm install
npm start
```

Сервер поднимется на `http://localhost:3000`.

2. Во втором терминале запустить клиент:

```bash
npm install
npm start
```

Откроется `http://localhost:8080` — клиент автоматически подключится к локальному серверу.

## Деплой

- **Frontend** собирается Webpack и деплоится на GitHub Pages через GitHub Actions при каждом пуше (см. `.github/workflows/web.yml`).
- **Backend** нужно развернуть на Render (папка `backend`, команда запуска `npm start`), затем подставить полученный URL в константу `PROD_SERVER_URL` в `src/js/ChatApi.js`.
