import dotenv from "dotenv";

dotenv.config();
import express from "express";
import iposRouter from "./routes/ipos";
import authRouter from "./routes/auth";
import scrapeRouter from "./routes/scrapeIpos";
import sendMailsRouter from "./routes/sendMails";
import usersRouter from "./routes/users";

import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import passport from "passport";
import "./strategies/googleStrategy";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
const app = express();
const DB_URL = process.env.MONGO_URL as string;
mongoose
  .connect(DB_URL)
  .then(() => console.log("connected to database"))
  .catch((err) => {
    console.log(err);
  });

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 *60* 24 * 7,
      // Only send cookie over HTTPS in production.
      // Must be true when using sameSite: "none"
      secure: process.env.NODE_ENV === "production",
      // Allow cookie to be sent from backend (Render)
      // to frontend on a different domain (Vercel).
      // Chrome requires "none" and secure: true for this.
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // Prevent javascript from accessing the cookie (extra security)
      httpOnly: true,
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = 3000;

app.use(authRouter);
app.use(iposRouter);
app.use(scrapeRouter);
app.use(sendMailsRouter);
app.use(usersRouter);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
