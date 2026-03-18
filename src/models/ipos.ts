import mongoose from "mongoose";
import { IPOS } from "../dtos/Ipos.dto";

const iposSchema = new mongoose.Schema<IPOS>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    issueManager: {
      type: String,
      required: true,
    },
    issuedUnit: {
      type: String,
      required: true,
    },
    closeDate: {
      type: Date,
      required: true,
    },
    openDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "upcoming"],
      default: "upcoming",
    },
  },
  { timestamps: true },
);

export const Ipos = mongoose.model("Ipos", iposSchema);
