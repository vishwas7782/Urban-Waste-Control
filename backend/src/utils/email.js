const nodemailer = require('nodemailer');

// Reusable Gmail transporter built from env credentials.
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send the account verification email. The link points at the frontend,
// which reads the token and calls GET /verify-email.
const sendVerificationEmail = async (name, email, token) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationLink = `${clientUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'urbanwastecontrolindia@gmail.com',
        to: email,
        subject: 'Email Verification',
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #059669;">Welcome to Urban Waste Control!</h2>
                <p style="color: #555555;">Dear ${name},</p>
                <p style="color: #555555;">
                    Thank you for signing up with Urban Waste Control. Before we can complete your registration, we need to verify your email address.
                    Please click the button below to verify your email:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}"
                        style="background-color: #059669; color: white; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #555555;">If the button above doesn't work, copy and paste the following link into your browser:</p>
                <p style="color: #0284c7; word-break: break-all;">${verificationLink}</p>
                <hr style="border-top: 1px solid #e4e4e4; margin: 30px 0;">
                <p style="color: #888888; font-size: 12px; text-align: center;">
                    Urban Waste Control System | &copy; 2024 All rights reserved
                </p>
            </div>
        </div>`,
    };

    return transporter.sendMail(mailOptions);
};

// Deliver a contact-form submission to the support inbox.
const sendContactEmail = async ({ name, email, subject, message }) => {
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER || 'urbanwastecontrolindia@gmail.com',
        subject: `New Contact Message: ${subject}`,
        text: `You have received a new message from ${name} (${email}):\n\n${message}`,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendVerificationEmail, sendContactEmail };
