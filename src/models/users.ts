import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    googleId?: string;
    email: string;
    password?: string;
    role: "admin" | "user";
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
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

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema)


