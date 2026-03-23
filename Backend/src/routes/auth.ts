import { Router } from "express";
import passport from "passport";
import { protect } from "../middlewares/authHandler";

const authRouter = Router();

authRouter.get("/auth/google", passport.authenticate("google"));

authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}?auth=failure`,
  }),
  (request, response) => {
    response.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}?auth=success`);
  },
);

authRouter.get("/auth/me", protect, (req, res) => {
  res.status(200).send({message:"successful",data: req.user});
});

authRouter.post("/logout", (req, res) => {
  console.log(req.user);
  
  if (!req.user) return res.sendStatus(401);
  req.logOut((err) => {
    if (err) return res.status(400).send({ message: "failed to log out" });
    res.status(200).send({ message: "successfully logged out" });
  });
});

export default authRouter;
