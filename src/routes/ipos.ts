import { Router } from "express";
import { getCurrentIpos } from "../controllers/ipos";

const router = Router();
router.get("/currentIpos", getCurrentIpos)

export default router