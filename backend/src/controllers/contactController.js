const asyncHandler = require('../utils/asyncHandler');
const { sendContactEmail } = require('../utils/email');

// POST /send-contact-mail
exports.sendContactMail = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    await sendContactEmail({ name, email, subject, message });
    res.json({ success: true, message: 'Email sent successfully' });
});
