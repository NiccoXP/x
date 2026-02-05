const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    conversationId: mongoose.Schema.Types.ObjectId,
    sender: mongoose.Schema.Types.ObjectId,
    content: String,
    isSeen: { type: Boolean, default: false },
    isVanish: { type: Boolean, default: false },
    expireAt: { type: Date, default: null, index: { expires: 0 } } 
});
module.exports = mongoose.model('Message', messageSchema);
