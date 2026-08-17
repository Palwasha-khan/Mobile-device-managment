import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  try {

    const transporter = createTransporter();
    console.log("host:", process.env.EMAIL_HOST,)
    console.log("to",to)
    console.log("subject",subject)
    console.log("html",html)
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("email sent successfully to:", to);
  } catch (error) { 
    console.error("Email send failed:", error.message);
  }
};