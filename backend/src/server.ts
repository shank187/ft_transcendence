import app from './app';
import {WebSocketServer} from 'ws';
import { prisma } from './lib/prisma';
import { initializeChat } from './modules/chat/chat.logic' 

const PORT = Number(process.env.PORT) || 3000;

const wss = new WebSocketServer({ noServer:true })

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


initializeChat(wss)

server.on('upgrade', (req, socket, head) => {
    if (req.url === '/chat') {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req)
        })
    }
    else 
        socket.destroy()
})

const shutdown = async () => {
    console.log('Shutting down server...');

    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);