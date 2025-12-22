import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure the transporter using SMTP variables from .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT),
  secure: false, // use true for port 465
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
      text,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};