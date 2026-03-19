import { Router } from "express";
import { getUsers } from "../controllers/users";

const router = Router();
router.get("/getUsers", getUsers);
// router.get("/:id",getUserById)

// /api/users
// router.post("/",createUser)

export  default router