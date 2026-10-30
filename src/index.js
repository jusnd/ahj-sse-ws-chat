import './css/style.css';
import Chat from './js/Chat';

const container = document.querySelector('#chat');
const chat = new Chat(container);
chat.init();
