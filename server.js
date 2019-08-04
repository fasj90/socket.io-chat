const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = 3000;

//Mensajes escritos en el chat
const messages = [];
//Usuarios que estan escribiendo en un determinado momento
const typingUsers = {};

app.use(express.static(path.join(__dirname, 'public')));

//Evento predefinido
io.on('connection', (client) => {
    console.log('Nuevo cliente conectado');

    //Eventos propios >>>
    client.emit('history', messages);

    client.on('new-message', (msg) => {
        console.log('new-message', msg);
        messages.push(msg);
        client.broadcast.emit('new-message', msg);
    });

    client.on('start-typing', (username) => {
        typingUsers[username] = true;
        client.broadcast.emit('on-typing', typingUsers);
    });

    client.on('stop-typing', (username) => {
        delete typingUsers[username];
        client.broadcast.emit('on-typing', typingUsers);
    });
    //Eventos propios <<<

    //Evento predefinido
    client.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});