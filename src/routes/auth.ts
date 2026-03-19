import { Router } from "express";
import passport from "passport";

 const authRouter = Router();

authRouter.get("/auth/google", passport.authenticate("google"));

authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (request, response) => {
    response.redirect("/");
  }
  
);

export default authRouter