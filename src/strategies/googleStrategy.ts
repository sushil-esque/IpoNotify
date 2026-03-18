import passport from "passport";
import passportGoogle from "passport-google-oauth2"
import { User } from "../models/users";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const GoogleStrategy = passportGoogle.Strategy;

// interface User{
//      googleId: string
//     email: string
//     password:string
// }

passport.serializeUser((user: any, done) => {
  console.log(`Inside Serilize User`);
  console.log(user);
  done(null, user.id);
}); //Runs once per login, Converts user → ID

passport.deserializeUser(async (id, done) => {
  console.log(`Inside Deserializer`);
  console.log(`Deserializing User id: ${id}`);
  try {
    const findUser = await User.findById(id);
    if (!findUser) {
      return done(null, null);
    }
    return done(null, findUser);
  } catch (err) {
    return done(err, null);
  }
}); //Runs on every request, Converts ID → user
export default passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/google/callback",
      scope: ["profile", "email"]
    },
  async (acessToken, refreshToken, profile, done) => {
      console.log(profile);
      let findUser;

      try {
        findUser = await User.findOne({  googleId: profile.id });
      } catch (err) {
        return done(err, null);
      }
      if (!findUser) {
        const newUser = new User({
          googleId: profile.id,          // Google's unique ID for this user
          email: profile.email,          // Email address from Google profile
        });
        try {
          const newSavedUser = await newUser.save();
          done(null, newSavedUser);
        } catch (err) {
          console.log(err);
          return done(err, null);
        }
      }
      return done(null, findUser);
    }
  )
);