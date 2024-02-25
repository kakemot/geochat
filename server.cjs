const WebSocket = require('ws');

const server = require('http').createServer();
const wss = new WebSocket.Server({ server });
server.listen(8081);

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
