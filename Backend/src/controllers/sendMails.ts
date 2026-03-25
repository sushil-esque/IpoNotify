import { NextFunction, Request, Response } from "express";
import { Ipos } from "../models/ipos";
import { customError } from "../utils/customErrorClass";
import { User } from "../models/users";
import sgMail from "@sendgrid/mail";
import { asyncHandler } from "../middlewares/asyncHandler";
import { google } from "googleapis";

type QueryType = {
  secret?: string;
};

// Helper function to create the raw email base64 string
const makeBody = (
  bcc: string,
  to: string,
  from: string,
  subject: string,
  message: string,
) => {
  const encodedSubject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const str = [
    `Content-Type: text/html; charset="UTF-8"\n`,
    `MIME-Version: 1.0\n`,
    `Content-Transfer-Encoding: 8bit\n`,
    `to: ${to}\n`,
    `from: ${from}\n`,
    `bcc: ${bcc}\n`,
    `subject: ${encodedSubject}\n\n`,
    message,
  ].join("");

  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const sendMailsByGoogle = asyncHandler(
  async (req: Request<{}, {}, {}, QueryType>, res: Response) => {
    if (req.query.secret !== process.env.QUERY_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Initialize OAuth2 client for Gmail API
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground",
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? null,
    });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const now = new Date();
    // Use UTC for consistent date bounding to avoid timezone issues where dates scrape differently
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const endOfToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    // Get IPOs that are strictly opening today OR closing today
    const IposToSendToday = await Ipos.find({
      $or: [
        { openDate: { $gte: startOfToday, $lte: endOfToday } },
        { closeDate: { $gte: startOfToday, $lte: endOfToday } },
      ],
    });

    if (!IposToSendToday || IposToSendToday.length === 0) {
      return res.send("no Ipos to send today");
    }

    const users = await User.find();
    if (!users || users.length === 0) return res.send("no users");

    const userEmails = users
      .map((u) => u.email)
      .filter((email) => email && email !== process.env.FROM_EMAIL)
      .join(",");

    const ipoList = IposToSendToday.map((ipo) => {
      // Check if it's strictly opening or closing today using the UTC bounds
      const isOpeningToday =
        ipo.openDate >= startOfToday && ipo.openDate <= endOfToday;
      const isClosingToday =
        ipo.closeDate >= startOfToday && ipo.closeDate <= endOfToday;

      let statusMessage =
        "🟢 This IPO is currently ACTIVE and open for subscription.";
      let borderColor = "#2196F3"; // Blue for generally open

      if (isOpeningToday) {
        statusMessage =
          "🚀 Big News! This IPO is officially OPEN for subscription today. Time to get your funds ready!";
        borderColor = "#4CAF50"; // Green
      } else if (isClosingToday) {
        statusMessage =
          "⏰ LAST CHANCE! This IPO is CLOSING today. If you haven't filled out the form, hurry up—the deadline is approaching!";
        borderColor = "#F44336"; // Red
      }

      return `
    <li>
      <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid ${borderColor}; background: #f9f9f9;">
        <strong style="font-size: 18px;">${ipo.name}</strong><br/>
        <p style="font-size: 16px; color: #333;">${statusMessage}</p>
        <span style="color: #666;">🗓 <strong>Open Date:</strong> ${new Date(ipo.openDate).toDateString()}</span><br/>
        <span style="color: #666;">⌛ <strong>Close Date:</strong> ${new Date(ipo.closeDate).toDateString()}</span>
      </div>
    </li>
  `;
    }).join("");

    const fromEmail =
      process.env.FROM_EMAIL || "IPO Alerts <alerts@iporeminder.com>";
    const subject = `🚀 IPO Alert: ${IposToSendToday.length} Update(s) for Today!`;
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif;">
      <h2>📢 Current IPO alerts</h2>
      <p>Here are the IPOs you can apply for right now:</p>
      <ul style="list-style-type: none; padding: 0;">${ipoList}</ul>
      <p>Don't miss the deadlines!</p>
      <hr/>
      <small>This is an automated reminder.</small>
    </div>
  `;

    // Create the display name for the sender
    const senderEmail = process.env.FROM_EMAIL || "alerts@iporeminder.com";
    const formattedFrom = `"IpoNotify" <${senderEmail}>`;

    // Creates raw message encoding. Using BCC here so recipients can't see each other's emails
    const rawMessage = makeBody(
      userEmails, // BCC
      formattedFrom, // To (send to yourself)
      formattedFrom, // From (shows as IpoNotify)
      subject,
      htmlMessage,
    );

    try {
      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: rawMessage,
        },
      });

      console.log("Message sent via Gmail API:", response.data.id);
      res
        .status(200)
        .json({ message: "Emails sent successfully using Gmail API" });
    } catch (err:any) {
      console.error("Gmail API Error:", err);
      res
        .status(500)
        .json({
          message: "Failed to send emails via Gmail API",
          error: err.message || "Unknown error",
        });
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
