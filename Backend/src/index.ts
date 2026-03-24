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
const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  frontendUrl.replace(/\/$/, ""), // Ensure no trailing slash
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    saveUninitialized: false,
    resave: false,
    proxy: true, // Required for some proxy setups to trust Secure cookies
    cookie: {
      maxAge: 60000 * 60 * 24 * 7,
      // Force Secure and SameSite: none for cross-domain (Vercel -> Render)
      secure: process.env.NODE_ENV === "production" || !!process.env.RENDER,
      // sameSite: (process.env.NODE_ENV === "production" || !!process.env.RENDER) ? "none" : "lax",
      sameSite: "lax", // Lax works perfectly when using rewrites!
      httpOnly: true,
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

app.use(authRouter);
app.use(iposRouter);
app.use(scrapeRouter);
app.use(sendMailsRouter);
app.use(usersRouter);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
