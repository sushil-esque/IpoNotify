import { NextFunction, Request, Response } from "express";
import { Ipos } from "../models/ipos";
import { customError } from "../utils/customErrorClass";
import { User } from "../models/users";
import sgMail from "@sendgrid/mail";
import { asyncHandler } from "../middlewares/asyncHandler";
import { google } from "googleapis";
import { QueryType } from "../types/queryType";
import { IPOS } from "../dtos/Ipos.dto";

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

export const sendMailsByGoogle = asyncHandler<{}, {}, {}, QueryType>(
  async (req, res) => {
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
    console.log(startOfToday, endOfToday);
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

    const GeneralIposToSendToday = await Ipos.find({
      $or: [
        { openDate: { $gte: startOfToday, $lte: endOfToday } },
        { closeDate: { $gte: startOfToday, $lte: endOfToday } },
      ],
      category: "general_public",
    });

    const ForeignIposToSendToday = await Ipos.find({
      $or: [
        { openDate: { $gte: startOfToday, $lte: endOfToday } },
        { closeDate: { $gte: startOfToday, $lte: endOfToday } },
      ],
      category: "foreign_employment",
    });

    const ReservedIposToSendToday = await Ipos.find({
      $or: [
        { openDate: { $gte: startOfToday, $lte: endOfToday } },
        { closeDate: { $gte: startOfToday, $lte: endOfToday } },
      ],
      category: "reserved",
    });

    const users = await User.find();
    if (!users || users.length === 0) return res.send("no users");

    //Users
    const usersSubscribedToGeneral = await User.find({
      subscribedCategory: "general_public",
    });
    const usersSubscribedToForeign = await User.find({
      subscribedCategory: "foreign_employment",
    });
    const usersSubscribedToReserved = await User.find({
      subscribedCategory: "reserved",
    });
    const usersSubscribedToAll = await User.find({
      subscribedCategory: "all",
    });

    const generalEmails = usersSubscribedToGeneral
      .map((u) => u.email)
      .join(",");
    const foreignEmails = usersSubscribedToForeign
      .map((u) => u.email)
      .join(",");
    const reservedEmails = usersSubscribedToReserved
      .map((u) => u.email)
      .join(",");
    const allEmails = usersSubscribedToAll.map((u) => u.email).join(",");

    const ipoListt = (IoposToSend: IPOS[]) => {
      return IoposToSend.map((ipo) => {
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
    };

    const subjectt = (IposToSend: IPOS[]) => {
      return `🚀 IPO Alert: ${IposToSend.length} Update(s) for Today!`;
    };

    const htmlMessagee = (IposToSend: IPOS[]) => {
      return `
    <div style="font-family: Arial, sans-serif;">
      <h2>📢 IPO alerts for you</h2>
      <p>Here are the IPOs opening or closing today:</p>
      <ul style="list-style-type: none; padding: 0;">${ipoListt(IposToSend)}</ul>
      <p>Don't miss the deadlines!</p>
      <hr/>
      <small style="color: #666;">
        You are receiving this because you signed up for IPO Notify.<br/>
        Want to change your alerts or stop receiving these emails? 
        <a href="https://ipo-notify.vercel.app/" style="color: #5177f6;">Manage your subscription preferences here</a>.
      </small>
    </div>
  `;
    };

    // Create the display name for the sender
    const senderEmail = process.env.FROM_EMAIL;
    const formattedFrom = `"IpoNotify" <${senderEmail}>`;

    try {
      if (generalEmails.length > 0 && GeneralIposToSendToday.length > 0) {
        const subjectGeneral = subjectt(GeneralIposToSendToday);
        const htmlMessageGeneral = htmlMessagee(GeneralIposToSendToday);
        // Creates raw message encoding. Using BCC here so recipients can't see each other's emails
        const rawMessageGeneral = makeBody(
          generalEmails, //BCC
          formattedFrom, //To
          formattedFrom, //From
          subjectGeneral,
          htmlMessageGeneral,
        );
        const response = await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: rawMessageGeneral,
          },
        });
        console.log(
          "Message sent for general users via Gmail API:",
          response.data.id,
        );
      }
      if (foreignEmails.length > 0 && ForeignIposToSendToday.length > 0) {
        const subjectForeign = subjectt(ForeignIposToSendToday);
        const htmlMessageForeign = htmlMessagee(ForeignIposToSendToday);
        const rawMessageForeign = makeBody(
          foreignEmails,
          formattedFrom,
          formattedFrom,
          subjectForeign,
          htmlMessageForeign,
        );
        const response = await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: rawMessageForeign,
          },
        });
        console.log(
          "Message sent for foreign users via Gmail API:",
          response.data.id,
        );
      }
      if (reservedEmails.length > 0 && ReservedIposToSendToday.length > 0) {
        const subjectReserved = subjectt(ReservedIposToSendToday);
        const htmlMessageReserved = htmlMessagee(ReservedIposToSendToday);
        const rawMessageReserved = makeBody(
          reservedEmails,
          formattedFrom,
          formattedFrom,
          subjectReserved,
          htmlMessageReserved,
        );
        const response = await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: rawMessageReserved,
          },
        });
        console.log(
          "Message sent for reserved users via Gmail API:",
          response.data.id,
        );
      }
      if (allEmails.length > 0 && IposToSendToday.length > 0) {
        const subjectAll = subjectt(IposToSendToday);
        const htmlMessageAll = htmlMessagee(IposToSendToday);
        const rawMessageAll = makeBody(
          allEmails,
          formattedFrom,
          formattedFrom,
          subjectAll,
          htmlMessageAll,
        );
        const response = await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: rawMessageAll,
          },
        });
        console.log(
          "Message sent for all subscribed users via Gmail API:",
          response.data.id,
        );
      }
      if (
        (generalEmails.length > 0 && GeneralIposToSendToday.length > 0) ||
        (foreignEmails.length > 0 && ForeignIposToSendToday.length > 0) ||
        (reservedEmails.length > 0 && ReservedIposToSendToday.length > 0) ||
        (allEmails.length > 0 && IposToSendToday.length > 0)
      ) {
        res
          .status(200)
          .send({ message: "Emails sent successfully using Gmail API" });
      } else {
        res.status(200).send({ message: "No emails and ipos to send" });
      }
    } catch (err: any) {
      console.error("Gmail API Error:", err);
      res.status(500).send({
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
