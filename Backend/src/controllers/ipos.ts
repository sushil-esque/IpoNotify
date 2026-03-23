import { NextFunction, Request, Response } from "express";
import { Ipos } from "../models/ipos";
import { customError } from "../utils/customErrorClass";
import { asyncHandler } from "../middlewares/asyncHandler";

export const getCurrentIpos = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const ipos = await Ipos.find({ status: "open" });
    const currentIpos = ipos.filter(
      (ipo) => ipo.openDate <= new Date() && ipo.closeDate >= new Date(),
    );
    return res.status(200).send({ message: "success", data: currentIpos });
  },
);
