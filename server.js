// server.js

const express = require('express');
const net = require('net');
const dgram = require('dgram'); // For UDP checks if needed
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for TCP check
app.get('/api/check-tcp', (req, res) => {
    const { host, port } = req.query;

    if (!host || !port) {
        return res.status(400).json({ status: 'Error', message: 'Host and port are required' });
    }

    const socket = new net.Socket();
    socket.setTimeout(5000); // 5-second timeout

    socket.connect(port, host, () => {
        socket.destroy();
        res.json({ host, port, status: 'Open' });
    });

    socket.on('error', (err) => {
        socket.destroy();
        res.json({ host, port, status: 'Closed', error: err.message });
    });

    socket.on('timeout', () => {
        socket.destroy();
        res.json({ host, port, status: 'Timeout' });
    });
});

// API endpoint for UDP check (if needed)
app.get('/api/check-udp', (req, res) => {
    const { host, port } = req.query;

    if (!host || !port) {
        return res.status(400).json({ status: 'Error', message: 'Host and port are required' });
    }

    const client = dgram.createSocket('udp4');
    const message = Buffer.from('ping');

    client.send(message, 0, message.length, port, host, (err) => {
        if (err) {
            client.close();
            res.json({ host, port, status: 'Closed', error: err.message });
        } else {
            client.close();
            res.json({ host, port, status: 'Open' });
        }
    });

    client.on('error', (err) => {
        client.close();
        res.json({ host, port, status: 'Error', error: err.message });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
