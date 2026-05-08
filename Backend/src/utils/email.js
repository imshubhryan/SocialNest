const nodemailer = require('nodemailer');

const createTransporter = () => {
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const host = process.env.SMTP_HOST || 'smtp.zoho.com';
    
    console.log(`--- DEBUG: Using SMTP Host: ${host}, Port: ${port} ---`);
    
    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendVerificationEmail = async (email, username, verificationToken) => {
    const verificationLink = `${process.env.CORS_ORIGIN}/verify-email/${verificationToken}`;

    const htmlContent = `
    <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#FFF5F0;padding:40px 30px;border-radius:20px;">
        <div style="text-align:center;margin-bottom:30px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#E91E63,#C2185B);width:56px;height:56px;border-radius:16px;line-height:56px;font-size:24px;color:#fff;">🏠</div>
            <h1 style="margin:12px 0 0;color:#C2185B;font-size:24px;">Welcome to SocialNest 👋</h1>
        </div>

        <p style="color:#333;font-size:15px;line-height:1.6;">Hi <strong>${username}</strong>,</p>

        <p style="color:#333;font-size:15px;line-height:1.6;">Thanks for registering with us! We're excited to have you join the nest.</p>

        <p style="color:#333;font-size:15px;line-height:1.6;">Please confirm your email address by clicking the button below:</p>

        <div style="text-align:center;margin:30px 0;">
            <a href="${verificationLink}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E91E63,#C2185B);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px;box-shadow:0 4px 15px rgba(194,24,91,0.3);">
                ✅ Verify Email
            </a>
        </div>

        <p style="color:#888;font-size:13px;line-height:1.5;">If you didn't create this account, you can safely ignore this email.</p>

        <hr style="border:none;border-top:1px solid rgba(194,24,91,0.1);margin:25px 0;" />

        <p style="color:#888;font-size:13px;">Thanks,<br/><strong style="color:#C2185B;">SocialNest Team</strong></p>
    </div>
    `;

    const mailOptions = {
        from: `SocialNest <${process.env.SMTP_USER}>`,
        to: email,
        subject: '✅ Verify your SocialNest account',
        html: htmlContent,
    };

    try {
        const transporter = createTransporter();
        console.log("Attempting to send email to:", email);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Success: Verification email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ SMTP Error details:');
        console.error('Code:', error.code);
        console.error('Response:', error.response);
        console.error('Message:', error.message);
        return false;
    }
};

const sendPasswordResetEmail = async (email, username, resetToken) => {
    const resetLink = `${process.env.CORS_ORIGIN}/reset-password/${resetToken}`;

    const htmlContent = `
    <div style="max-width:520px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#FFF5F0;padding:40px 30px;border-radius:20px;">
        <div style="text-align:center;margin-bottom:30px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#E91E63,#C2185B);width:56px;height:56px;border-radius:16px;line-height:56px;font-size:24px;color:#fff;">🔑</div>
            <h1 style="margin:12px 0 0;color:#C2185B;font-size:24px;">Reset Your Password</h1>
        </div>

        <p style="color:#333;font-size:15px;line-height:1.6;">Hi <strong>${username}</strong>,</p>

        <p style="color:#333;font-size:15px;line-height:1.6;">We received a request to reset your password for your SocialNest account. Don't worry, we've got you covered!</p>

        <p style="color:#333;font-size:15px;line-height:1.6;">Please click the button below to choose a new password. This link is valid for 1 hour.</p>

        <div style="text-align:center;margin:30px 0;">
            <a href="${resetLink}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E91E63,#C2185B);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px;box-shadow:0 4px 15px rgba(194,24,91,0.3);">
                🔄 Reset Password
            </a>
        </div>

        <p style="color:#888;font-size:13px;line-height:1.5;">If you didn't request a password reset, you can safely ignore this email and your password will remain the same.</p>

        <hr style="border:none;border-top:1px solid rgba(194,24,91,0.1);margin:25px 0;" />

        <p style="color:#888;font-size:13px;">Thanks,<br/><strong style="color:#C2185B;">SocialNest Team</strong></p>
    </div>
    `;

    const mailOptions = {
        from: `SocialNest <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔒 Reset your SocialNest Password',
        html: htmlContent,
    };

    try {
        const transporter = createTransporter();
        console.log("Attempting to send password reset email to:", email);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Success: Password reset email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ SMTP Error details (Password Reset):');
        console.error('Code:', error.code);
        console.error('Response:', error.response);
        console.error('Message:', error.message);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
