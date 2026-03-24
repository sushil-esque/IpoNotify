import passport from "passport";
import passportGoogle from "passport-google-oauth2";
import { User, IUser } from "../models/users";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const GoogleStrategy = passportGoogle.Strategy;



passport.serializeUser((user: Express.User, done) => {
  console.log(`Inside Serilize User`);
  console.log(user);
  done(null, user.id);
}); //Runs once per login, Converts user → ID

passport.deserializeUser(async (id, done) => {
  console.log(`[DEBUG] Inside Deserializer, ID: ${id}`);    
  try {
    const findUser = await User.findById(id).lean();
    if (!findUser) {
      console.log(`[DEBUG] Deserializer: User NOT found in DB for ID: ${id}`);
      return done(null, null);
    }
    const user = { ...findUser, id: findUser._id.toString() };
    console.log(`[DEBUG] Deserializer: User FOUND: ${user.email}`);
    return done(null, user);
  } catch (err) {
    console.error(`[DEBUG] Deserializer ERROR:`, err);
    return done(err, null);
  }
}); //Runs on every request, Converts ID → user
export default passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5000/auth/google/callback",
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
          email: profile.emails?.[0]?.value,          // Email address from Google profile
          name: profile.displayName,
          picture: profile.photos?.[0]?.value,
        });
        try {
          const newSavedUser = await newUser.save();
          return done(null, newSavedUser);
        } catch (err) {
          console.log(err);
          return done(err, null);
        }
      } else {
        // Update user if name or picture is missing
        if (!findUser.name || !findUser.picture) {
           findUser.name = profile.displayName;
           findUser.picture = profile.photos?.[0]?.value;
           await findUser.save();
        }
      }
      return done(null, findUser);
    }
  )
);