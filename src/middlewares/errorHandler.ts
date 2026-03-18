import { NextFunction, Request, Response } from "express";

export interface AppError extends Error {
    status?: number;

}

export const errorHandler =(
    err: AppError,
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    console.log(err);
  
    res.status(err.status || 500).send({
        message:err.message || "Internal Server Error"
    })
    
}