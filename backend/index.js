const express = require("express");
const app = express();
const server = require("http").createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({server: server});
const moment = require('moment');

const createMsg = ({name: name, message: message}) => {
    const connectedTime = new Date();
    const msg = {
        name: name,
        message: message,
        time: moment(connectedTime).format("A HH:mm"),
        connectedTime: connectedTime
    };

    return msg;
};

let guestIndex = 0;

wss.on('connection', function connection(ws) {
    const welcomeMsg = createMsg({name: "System", message: "Welcome New Client!"});
    welcomeMsg.initUserId = "Guest_" + ++guestIndex;
    ws.send(JSON.stringify(welcomeMsg));
    console.log('A new client Connected!: ' + JSON.stringify(welcomeMsg));

    ws.on('message', function incoming(data) {
        console.log('received: %s', data);

        const params = JSON.parse(data);
        const msg = createMsg({name: params.name, message: params.message});

        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(msg));
            }
        });
    });
});

app.get('/', (req, res) => res.send('Hello World!'));

server.listen(3000, () => console.log(`Lisening on port :3000`));