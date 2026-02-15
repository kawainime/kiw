const http = require('http');
const app = require('./backend/src/app');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: '*', // Sesuaikan jika ingin lebih ketat di production
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

io.on('connection', socket => {
    console.log('Socket.io client connected:', socket.id);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`NOKOSKU backend running on http://localhost:${PORT}`);
});
