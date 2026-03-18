import { Router } from "express";
import passport from "passport";

 const authRouter = Router();

authRouter.get("/google", passport.authenticate("google"));

authRouter.get(
  "/google/callback",
  passport.authenticate("google"),
  (request, response) => 
  {
    return response.sendStatus(200);
  }
  
);

export default authRouter