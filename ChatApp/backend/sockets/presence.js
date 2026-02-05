const redisClient = require('../config/redis');

module.exports = (io) => {
    io.on("connection", async (socket) => {
        const userId = socket.handshake.query.userId;
        if (!userId) return;

        // Mark Online in Redis
        await redisClient.set(`online:${userId}`, "true");
        io.emit("user_status", { userId, status: "online" });

        socket.on("disconnect", async () => {
            await redisClient.del(`online:${userId}`);
            io.emit("user_status", { userId, status: "offline" });
        });
    });
};
