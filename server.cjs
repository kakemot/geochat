const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 80, path: '/chat' });

const clients = new Set();

wss.on('connection', function connection(ws) {
    clients.add(ws);
    console.log('Client connected. Total clients:', clients.size);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        
        // Broadcast incoming message to all clients except the sender
        for (let client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    });

    ws.on('close', function close() {
        clients.delete(ws);
        console.log('Client disconnected. Total clients:', clients.size);
    });
});

console.log('Chat server running');
