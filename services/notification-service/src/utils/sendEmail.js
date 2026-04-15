const transporter = require("../config/emailConfig");

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;