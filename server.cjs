const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });
const clients = new Map(); // Use a Map to associate clients with locations

function checkIfNearby(long1, lat1, long2, lat2, km) {
    // Radius of the Earth in kilometers
    const R = 6371;

    // Convert degrees to radians
    const rad = (deg) => deg * (Math.PI / 180);

    // Difference in coordinates
    const dLat = rad(lat2 - lat1);
    const dLong = rad(long2 - long1);

    // Apply Haversine formula
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in kilometers
    const distance = R * c;

    // Check if the distance is less than or equal to the specified kilometers
    console.log(distance);
    return distance <= km;
}

function broadcastMessage(message, senderWs, senderLocation) {
    clients.forEach((location, client) => {
        if (client.readyState === WebSocket.OPEN && client !== senderWs) { // Directly compare WebSocket instances
            if (checkIfNearby(location.longitude, location.latitude, location.longitude, senderLocation.latitude, 10)) {
                client.send(message);
            }
        }
    });
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        const message = JSON.parse(data); // Assuming message format is JSON
        if (message.type === 'location') {
            clients.set(ws, { latitude: message.latitude, longitude: message.longitude });
        } else if (message.type === 'chat') {
            console.log('received: %s', message.content);
            const senderLocation = clients.get(ws);
            if (senderLocation) {
                broadcastMessage(message.content, ws, senderLocation); // Pass the WebSocket instance directly
            }
        }
    });

    ws.on('close', function close() {
        clients.delete(ws);
    });
});
console.log('Chat server running');