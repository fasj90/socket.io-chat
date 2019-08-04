let socket;
let messages = [];
let typingInterval;

function init() {
    const newMessage = document.querySelector('#new-message');
    const btnStart = document.querySelector('#btnStart');
    console.log(newMessage, btnStart);

    newMessage.addEventListener('keyup', function(event) {
        //Se presiono la tecla enter
        if(event.keyCode === 13) {
            sendMessage();
        }

        this.lastTyped = Date.now();
        if(!typingInterval){
            startTypingInterval();
        }
    });

    btnStart.addEventListener('click', function() {
        const username = document.querySelector('#username');
        if(username.value !== '') {
            username.style = '';
            username.disabled = true;
            this.disabled = true;
            document.querySelector('#new-message').disabled = false;
            connect();
        } else {
            username.style = 'border-color: red';
        }
    });
}

function connect() {
    socket = io.connect();

    socket.on('history', history => {
        messages = [ ...history ];
        renderMessages();
    });
    socket.on('new-message', onNewMessage);
    socket.on('on-typing', onTyping);
}

function addMessage(message) {
    messages.push(message);
}

function sendMessage() {
    const message = {
        author: document.querySelector('#username').value,
        text: document.querySelector('#new-message').value
    };
    addMessage(message);

    socket.emit('new-message', message);

    renderMessages();

    document.querySelector('#new-message').value = '';
}

function onNewMessage(message) {
    addMessage(message);
    renderMessages();
}

function renderMessages() {
    const username = document.querySelector('#username').value;
    const html = messages.map(message => {
        let { author, text } = message;
        let type = 'other';
        if(author === username) {
            type = 'me';
            author = 'Yo';
        }
        return `<span class="${type}"><strong>${author}:</strong> ${text}</span>`;
    }).join(' ');
    document.querySelector('.messages').innerHTML = html;

    const lastMessage = document.querySelector('.messages > span:last-child');
    if(lastMessage) {
        document.querySelector('.messages').scrollTop = lastMessage.offsetTop;
    }
}

function startTypingInterval() {
    //console.log('Start typing');
    const input = document.querySelector('#new-message');
    typingInterval = setInterval(() => {
        //console.log('input.lastTyped', Date.now() - input.lastTyped, input.lastTyped);
        if(Date.now() - input.lastTyped > 1000) {
            stopTypingInterval();
        }
    }, 5000);
    socket.emit('start-typing', document.querySelector('#username').value);
}

function stopTypingInterval() {
    if(typingInterval) {
        //console.log('Stop typing');
        clearInterval(typingInterval);
        typingInterval = null;
        socket.emit('stop-typing', document.querySelector('#username').value);
    }
}

function onTyping(typingUsers) {
    const nick = document.querySelector('#username').value;
    const html = Object.keys(typingUsers)
    .filter(key => key !== nick)
    .map((nick) => {
        return `<li>${nick} is typing...</li>`;
    }).join(' ');
    document.querySelector('.info').innerHTML = html;
}