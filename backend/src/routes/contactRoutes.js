const express = require('express');
const router = express.Router();
const contact = require('../controllers/contactController');

router.post('/send-contact-mail', contact.sendContactMail);

module.exports = router;
