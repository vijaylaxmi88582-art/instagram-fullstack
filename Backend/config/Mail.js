import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `${process.env.EMAIL}`,
      to,
      subject: "Reset your Password",
      html: `
        <p>Your OTP for resetting your password is <b>${otp}</b>.</p>
        <p>It expires in 5 minutes.</p>
      `,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email Error:", error);
    throw error;
  }
};

export default sendEmail;