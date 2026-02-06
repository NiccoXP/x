module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.on("join_chat", (chatId) => socket.join(chatId));

        socket.on("send_msg", async (data) => {
            // Logic to emit message to room
            io.to(data.chatId).emit("new_msg", data);
        });

        socket.on("message_read", async ({ messageId, chatId, isVanish }) => {
            if (isVanish) {
                // High-tech auto-destruct
                const Message = require('../models/Message');
                await Message.findByIdAndUpdate(messageId, { expireAt: new Date(Date.now() + 5000) });
                io.to(chatId).emit("msg_vanishing", messageId);
            }
        });

        socket.on("screenshot_taken", (data) => {
            socket.to(data.chatId).emit("alert_screenshot", { user: data.username });
        });
    });
};
