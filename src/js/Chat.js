import ChatApi from './ChatApi';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.api = new ChatApi();
    this.user = null;

    this.modal = document.querySelector('#modal');
    this.nicknameForm = document.querySelector('#nickname-form');
    this.nicknameInput = document.querySelector('#nickname-input');
    this.modalError = document.querySelector('#modal-error');

    this.userList = this.container.querySelector('#user-list');
    this.messagesEl = this.container.querySelector('#messages');
    this.messageForm = this.container.querySelector('#message-form');
    this.messageInput = this.container.querySelector('#message-input');
  }

  init() {
    this.nicknameForm.addEventListener('submit', (e) => this.onRegister(e));
    this.messageForm.addEventListener('submit', (e) => this.onSend(e));

    // При закрытии/обновлении вкладки уведомляем сервер о выходе
    window.addEventListener('beforeunload', () => {
      if (this.user) {
        this.api.sendExit(this.user);
      }
    });
  }

  async onRegister(event) {
    event.preventDefault();
    const name = this.nicknameInput.value.trim();
    if (!name) {
      this.showError('Введите никнейм');
      return;
    }

    this.showError('');
    try {
      this.user = await this.api.register(name);
    } catch (err) {
      this.showError(err.message);
      return;
    }

    this.api.connect({
      onUsers: (users) => this.renderUsers(users),
      onMessage: (msg) => this.renderMessage(msg),
      onClose: () => this.onDisconnect(),
    });

    this.modal.classList.add('hidden');
    this.container.hidden = false;
    this.messageInput.focus();
  }

  onSend(event) {
    event.preventDefault();
    const text = this.messageInput.value.trim();
    if (!text || !this.user) return;

    this.api.sendMessage(text, this.user);
    this.messageInput.value = '';
    this.messageInput.focus();
  }

  onDisconnect() {
    const warning = document.createElement('div');
    warning.className = 'chat-messages__system';
    warning.textContent = 'Соединение с сервером потеряно';
    this.messagesEl.append(warning);
    this.scrollToBottom();
  }

  renderUsers(users) {
    this.userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.className = 'user-list__item';
      // Себя помечаем как You
      li.textContent = this.user && user.id === this.user.id ? 'You' : user.name;
      if (this.user && user.id === this.user.id) {
        li.classList.add('user-list__item_you');
      }
      this.userList.append(li);
    });
  }

  renderMessage(data) {
    const isOwn = this.user && data.user.id === this.user.id;

    const msg = document.createElement('div');
    msg.className = `message ${isOwn ? 'message_own' : 'message_other'}`;

    const header = document.createElement('div');
    header.className = 'message__header';
    const time = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    header.textContent = `${isOwn ? 'You' : data.user.name}, ${time}`;

    const text = document.createElement('div');
    text.className = 'message__text';
    text.textContent = data.message;

    msg.append(header, text);
    this.messagesEl.append(msg);
    this.scrollToBottom();
  }

  showError(text) {
    this.modalError.textContent = text;
    this.modalError.classList.toggle('visible', Boolean(text));
  }

  scrollToBottom() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}
