const nodemailer = require("nodemailer");
const UserModel = require('../models/user.model.js');
const logError = require('../utils/logger.js');

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

// създава се обект от тип транспортер, който създава тунел за изпращане на имейли
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD
    }
});

const verificationCodes = {};

const sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        // генериране на случайно 6-цифрено число
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        verificationCodes[email] = verificationCode;

        console.log("Verification Code:", verificationCode);
        
        // данните за изпращане в JSON формат
        const mailOptions = {
            from: SENDER_EMAIL,
            to: email,
            subject: "OSI-HR: Your Verification Code",
            html: `<p>Hello,</p><p>Your verification code is: <b>${verificationCode}</b></p><p>This code is valid for 10 minutes.</p>
            <br><br><hr><br>
            <p style="color: #888; font-weight: bold; text-transform: uppercase; margin: 0;">OSI-HR Security</p>
            <p style="color: #888; font-size: 12px; margin: 0;">System Verification Service</p>`
        };

        // използването на тунела за изпращане на имейл
        await transporter.sendMail(mailOptions);
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(200).json({ message: "VERIFICATION_CODE_SENT" });
    } catch (err) {
        logError(err, req, { className: 'email.controller', functionName: 'sendVerificationCode' });
        console.error("Error sending email:", err);
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ error: "ERROR_SENDING_CODE" });
    }
};

const verifyCode = async (req, res) => {
    const { email, code } = req.body;
    try {
        // сравнява генерирания и въведения код
        if (verificationCodes[email] && verificationCodes[email] == code) {
            delete verificationCodes[email];
            // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
            res.status(200).json({ success: true, message: "CODE_VALID" });
        } else {
            // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
            res.status(400).json({ success: false, error: "INVALID_CODE" });
        }
    } catch (err) {
        logError(err, req, { className: 'email.controller', functionName: 'verifyCode', user: email });
        console.error("Error verifying code:", err);
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        res.status(500).json({ error: "ERROR_VERIFYING_CODE" });
    }
};

const sendNotificationEmail = async (req, res) => {
    try {
      const { adminId, userId, notificationMessage } = req.body;

      const admin = await UserModel.findById( adminId );
      
      // операцията е разрешена само за администратори
      if(!admin || !admin.isAdmin){
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
        });
      }

      const user = await UserModel.findById( userId );

      if (!user || !user.email || !notificationMessage) {
        // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
        return res.status(400).json({ error: "MISSING_FIELDS_OR_USER_NOT_FOUND" });
      }
  
      // данните за изпращане в JSON формат
      const mailOptions = {
        from: SENDER_EMAIL,
        to: user.email,
        subject: "New notification for " + user.name, 
        html: notificationMessage + `<br><br><hr><br>
            <p style="color: #888; font-weight: bold; text-transform: uppercase; margin: 0;">OSI-HR</p>`,
      };
  
      // изпозлване на имейл тунела за изпращане на имейл
      await transporter.sendMail(mailOptions);
  
      // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
      res.status(200).json({ message: "NOTIFICATION_SENT_SUCCESSFULLY" });
    } catch (err) {
      logError(err, req, { className: 'email.controller', functionName: 'sendNotificationEmail', user: req.body.email });
      console.error("Error sending notification email:", err);
      // Връща се системен код вместо текст, за да се обработи във фронтенда и да се преведе
      res.status(500).json({ error: "ERROR_SENDING_NOTIFICATION" });
    }
};

module.exports = {
    sendVerificationCode,
    verifyCode,
    sendNotificationEmail
};