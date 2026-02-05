const router = require('express').Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Get all primary chats (Accepted)
router.get('/inbox', auth, async (req, res) => {
    const chats = await Conversation.find({
        participants: req.user.id,
        isAccepted: true
    }).populate('participants', 'username');
    res.json(chats);
});

// Get Message Requests (Not yet accepted)
router.get('/requests', auth, async (req, res) => {
    const requests = await Conversation.find({
        participants: req.user.id,
        isAccepted: false
    }).populate('participants', 'username');
    res.json(requests);
});

// Accept a request
router.put('/accept/:chatId', auth, async (req, res) => {
    const chat = await Conversation.findByIdAndUpdate(
        req.params.chatId, 
        { isAccepted: true }, 
        { new: true }
    );
    res.json(chat);
});

module.exports = router;
