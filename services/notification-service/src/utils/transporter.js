const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded:", !!process.env.EMAIL_PASS);

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verify failed:", error);
  } else {
    console.log("Mailer is ready");
  }
});

module.exports = transporter;