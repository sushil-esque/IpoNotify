import sgMail from "@sendgrid/mail"
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const msg = {
  to: 'soucesil1@gmail.com',
  from: process.env.FROM_EMAIL!, // Use the email address or domain you verified above
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

//ES8
(async () => {
  try {
    await sgMail.send(msg);
    console.log("Email has been sent");
    
  } catch (error:any) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
    }
  }
})();