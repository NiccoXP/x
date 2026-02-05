require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Redis Adapter Setup
const subClient = redisClient.duplicate();
Promise.all([redisClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(redisClient, subClient));
    console.log("⚡ Redis Adapter Ready");
});

// Middleware
connectDB();
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chats', require('./routes/chat'));

// Sockets
require('./sockets/chatSocket')(io);
require('./sockets/presence')(io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
