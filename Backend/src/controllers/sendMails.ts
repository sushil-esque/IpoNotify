import { NextFunction, Request, Response } from "express";
import { Ipos } from "../models/ipos";
import { customError } from "../utils/customErrorClass";
import { User } from "../models/users";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import path from "path";
import { asyncHandler } from "../middlewares/asyncHandler";
import nodemailer from "nodemailer";
import dns from "dns";

// Force Node.js to use IPv4 instead of IPv6 for DNS resolution
// This prevents the ENETUNREACH error on environments like Render
dns.setDefaultResultOrder("ipv4first");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

//ES8

type QueryType = {
  secret?: string;
};
const now = new Date();

export const sendMailsByGoogle = asyncHandler(
  async (req: Request<{}, {}, {}, QueryType>, res: Response) => {
    if (req.query.secret === process.env.QUERY_SECRET) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use true for port 465, false for port 587
        auth: {
          user: process.env.FROM_EMAIL!,
          pass: process.env.GOOGLE_APP_PASSWORD,
        },
      });
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      console.log("Request time:", now.toISOString());
      console.log("Start of Today (local):", startOfToday.toString());
      console.log("End of Today (local):", endOfToday.toString());

      const IposToSendToday = await Ipos.find({
        $or: [
          { openDate: { $gte: startOfToday, $lte: endOfToday } },
          { closeDate: { $gte: startOfToday, $lte: endOfToday } },
        ],
      });

      console.log("IPOs found:", IposToSendToday.length);
      if (IposToSendToday.length > 0) {
        console.log("IPOs names:", IposToSendToday.map(i => i.name));
      }
      
      if (!IposToSendToday || IposToSendToday.length === 0)
        return res.send("no Ipos to send today");
      const users = await User.find();
      if (!users || users.length === 0) return res.send("no users");

      const userEmails = users
        .map((u) => u.email)
        .filter((email) => email && email !== process.env.FROM_EMAIL);

      const ipoList = IposToSendToday
        .map((ipo) => {
          const statusMessage = ipo.openDate >= startOfToday && ipo.openDate <= endOfToday
            ? "🚀 Big News! This IPO is officially OPEN for subscription today. Time to get your funds ready!" 
            : "⏰ LAST CHANCE! This IPO is CLOSING today. If you haven't filled out the form, hurry up—the deadline is approaching!";
          
          return `
    <li>
      <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid ${ipo.openDate >= startOfToday && ipo.openDate<= endOfToday ? '#4CAF50' : '#F44336'}; background: #f9f9f9;">
        <strong style="font-size: 18px;">${ipo.name}</strong><br/>
        <p style="font-size: 16px; color: #333;">${statusMessage}</p>
        <span style="color: #666;">🗓 <strong>Open Date:</strong> ${new Date(ipo.openDate).toDateString()}</span><br/>
        <span style="color: #666;">⌛ <strong>Close Date:</strong> ${new Date(ipo.closeDate).toDateString()}</span>
      </div>
    </li>
  `;
        })
        .join("");
      (async () => {
        try {
          console.log(userEmails);

          const info = await transporter.sendMail({
            from: {
              name: "IPO Alert",
              address: process.env.FROM_EMAIL!,
            },
            to: userEmails,
            subject: `🚀 IPO Alert: ${IposToSendToday.length} Update(s) for Today!`,
            text: `There are ${IposToSendToday.length} IPO(s) opening/closing today. Check your dashboard for details.`,
            html: `
    <div style="font-family: Arial, sans-serif;">
      <h2>📢 Current IPO alerts</h2>
      <p>Here are the IPOs you can apply for right now:</p>

      <ul>
        ${ipoList}
      </ul>

      <p>Don't miss the deadlines!</p>

      <hr/>
      <small>This is an automated reminder.</small>
    </div>
  `,
          });

          console.log("Message sent:", info.messageId);
          res.status(200).json({ message: "Emails sent successfully" });
        } catch (err) {
          console.error(err);
          throw err;
        }
      })();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  },
);

// export const sendMailsBySG = asyncHandler(
//   async (
//     req: Request<{}, {}, {}, QueryType>,
//     res: Response,
//     next: NextFunction,
//   ) => {
//     if (req.query.secret === "suspicioushill") {
//       const currentIpos = await Ipos.find({
//         openDate: { $lte: now },
//         closeDate: { $gte: now },
//       });
//       if (!currentIpos || currentIpos.length === 0)
//         throw new customError("no currentIpos", 404);
//       const users = await User.find();
//       if (!users || users.length === 0) throw new customError("no users", 404);

//       const userEmails = users
//         .map((u) => u.email)
//         .filter((email) => email && email !== process.env.FROM_EMAIL);
//       const ipoList = currentIpos
//         .map((ipo) => {
//           return `
//     <li>
//       <strong>${ipo.name}</strong><br/>
//       Open: ${new Date(ipo.openDate).toDateString()}<br/>
//       Close: ${new Date(ipo.closeDate).toDateString()}
//     </li>
//   `;
//         })
//         .join("");
//       const msg = {
//         to: process.env.FROM_EMAIL!,
//         bcc: userEmails,
//         from: {
//           name: "IPO Alert",
//           email: process.env.FROM_EMAIL!,
//         }, // Use the email address or domain you verified above
//         subject: "📢 Active IPOs Reminder",
//         text: `There are ${currentIpos.length} IPO(s) currently open. Check your dashboard for details.`,
//         html: `
//     <div style="font-family: Arial, sans-serif;">
//       <h2>📢 Currently Open IPOs</h2>
//       <p>Here are the IPOs you can apply for right now:</p>

//       <ul>
//         ${ipoList}
//       </ul>

//       <p>Don't miss the deadlines!</p>

//       <hr/>
//       <small>This is an automated reminder.</small>
//     </div>
//   `,
//       };
//       try {
//         await sgMail.send(msg);
//         res.status(200).json({ message: "Emails sent successfully" });
//       } catch (error: any) {
//         if (error.response) {
//           console.error(JSON.stringify(error.response.body, null, 2));
//         }
//         throw error;
//       }
//     } else {
//       res.status(401).json({ message: "Unauthorized" });
//     }
//   },
// );
