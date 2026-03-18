import { Router } from "express";
import { addIpos } from "../utils/scrapeIpo";

const router = Router();

router.get("/scrapeIpos", (req, res) => {
  addIpos(req, res);
});
export default router;
