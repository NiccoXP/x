const router = require('express').Router();
const { login, signup, logout, update } = require('../controllers/auth.controllers');

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);
router.post('/update', update);

module.exports = router;