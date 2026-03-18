import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true,   // allows multiple docs without googleId (for local-auth users)
    },
    email:{
       type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password:{
        type: String,
        required: false,  // optional: Google OAuth users won't have a password
        select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
},{timestamps:true})

export const User = mongoose.model("User", userSchema)


