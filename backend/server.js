import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

const ROOM = 'group';

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('joinRoom', async (userName) => {
        console.log(`${userName} is joining the group.`);
        await socket.join(ROOM);
        socket.to(ROOM).emit('roomNotice', userName);
    });

    // --- THIS IS THE CHANGE ---
    socket.on('chatMessage', (msg) => {
        // Broadcast to everyone in the room (including the sender)
        io.to(ROOM).emit('chatMessage', msg);
    });
    // -------------------------

    socket.on('typing', (userName) => {
        socket.to(ROOM).emit('typing', userName);
    });

    socket.on('stopTyping', (userName) => {
        socket.to(ROOM).emit('stopTyping', userName);
    });
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

server.listen(4600, () => {
    console.log('server running at http://localhost:4600');
});