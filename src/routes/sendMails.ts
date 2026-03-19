import { Router } from "express";
import { sendMailsByGoogle } from "../controllers/sendMails";

const router = Router();

router.get("/sendMails", sendMailsByGoogle)

export default router