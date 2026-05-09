const nodemailer = require("nodemailer");
require("dotenv").config();

// КРИТИЧНО: Добавен е импортът на логъра, за да не хвърля ReferenceError в catch блока
const logError = require('../utils/logger.js'); 

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD
  }
});

exports.sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: SENDER_EMAIL,
      to,
      subject,
      html: html + `<br><br><hr><br>
            <p style="color: #888; font-weight: bold; text-transform: uppercase; margin: 0;">OSI-HR</p>
            <p style="color: #888; font-size: 12px; margin: 0;">email: martinstoimenov02@gmail.com</p>`
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    // Премахнат е next(err), тъй като това не е мидълуер/контролер и няма достъп до next.
    // Контролерът, който вика sendEmail, ще хване тази грешка и ще изпълни своя next().
    console.error("Error sending email:", err);
    logError(err, null, { className: 'email', functionName: 'sendEmail' });
    throw err; 
  }
};