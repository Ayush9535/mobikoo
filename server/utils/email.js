const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

let transporter = null;

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // This should be an App Password, not your regular Gmail password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

exports.sendEmail = async (to, subject, text) => {
  try {
    // Create transporter if it doesn't exist
    if (!transporter) {
      transporter = createTransporter();
    }

    // Verify transporter connection
    await transporter.verify();

    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    // If authentication fails, reset transporter to try again next time
    if (error.message.includes('Authentication')) {
      transporter = null;
    }
    throw error;
  }
};
