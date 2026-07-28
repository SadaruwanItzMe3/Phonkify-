const express = require('express');
const { register, login, googleSignIn, refresh, logout } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleSignIn);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
