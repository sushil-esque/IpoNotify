import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.FROM_EMAIL!,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});
(async () => {
  try {
    const info = await transporter.sendMail({
      from: {
        name: "IPO Alert",
        address: process.env.FROM_EMAIL!,
      },
      to: "soucesil1@gmail.com ",
      subject: "Hello ✔",
      text: "Hello world?", // Plain-text version of the message
      html: "<b>Hello world?</b>", // HTML version of the message
    });

    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error(err);
  }
})();
