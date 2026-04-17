const transporter = require("./transporter");

const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  console.log("Email sent:", info.response);
  return info;
};

module.exports = sendEmail;