/**
 * Слой взаимодействия с сервером чата:
 *  - регистрация никнейма через REST (POST /new-user);
 *  - обмен сообщениями через WebSocket.
 *
 * Адрес сервера:
 *  - при локальной разработке (страница открыта на localhost) — http://localhost:3000;
 *  - на GitHub Pages — адрес сервера, развёрнутого на Render.
 *    После деплоя backend на Render замените PROD_SERVER_URL на свой URL.
 */
const PROD_SERVER_URL = 'https://ahj-sse-ws-chat-backend.onrender.com';

function getServerUrl() {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return isLocal ? 'http://localhost:3000' : PROD_SERVER_URL;
}

export default class ChatApi {
  constructor() {
    this.baseUrl = getServerUrl();
    this.ws = null;
  }

  /**
   * Регистрация никнейма на сервере.
   * Возвращает объект пользователя { id, name }.
   * Бросает Error, если никнейм занят или сервер недоступен.
   */
  async register(name) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}/new-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    } catch {
      throw new Error('Сервер недоступен. Попробуйте позже.');
    }

    const data = await response.json();
    if (!response.ok || data.status !== 'ok') {
      throw new Error('Этот никнейм уже занят. Выберите другой.');
    }
    return data.user;
  }

  /**
   * Подключение к WebSocket-серверу.
   * handlers: { onUsers(list), onMessage(msg), onClose() }
   */
  connect(handlers) {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws');
    this.ws = new WebSocket(wsUrl);

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      // Сервер присылает либо массив пользователей, либо сообщение { type: 'send', ... }
      if (Array.isArray(data)) {
        handlers.onUsers(data);
      } else if (data.type === 'send') {
        handlers.onMessage(data);
      }
    });

    this.ws.addEventListener('close', () => {
      if (handlers.onClose) handlers.onClose();
    });
  }

  /** Отправка сообщения в чат */
  sendMessage(message, user) {
    this.send({ type: 'send', message, user });
  }

  /** Уведомление сервера о выходе пользователя */
  sendExit(user) {
    this.send({ type: 'exit', user });
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
