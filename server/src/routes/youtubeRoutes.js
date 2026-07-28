const express = require('express');
const { search, getDetails } = require('../controllers/youtubeController');

const router = express.Router();

router.get('/search', search);
router.get('/videos', getDetails);

module.exports = router;
