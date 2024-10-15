const express = require('express');
const router = express.Router();
const instaController = require('../controllers/instaController');

router.get('/posts/:perfil', instaController.getPosts);
module.exports = router;