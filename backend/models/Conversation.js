const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAccepted: { type: Boolean, default: false }, // Request Folder Logic
    vanishMode: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Conversation', conversationSchema);
