import { NextFunction, Request, Response } from "express";
import { User } from "../models/users";

type QueryType = {
  secret?: string;
};
export const getUsers = async (
  req: Request<{}, {}, {}, QueryType>,
  res: Response,
  next: NextFunction
) => {
    if(req.query.secret === "suspicioushill" ){
        const users = await User.find();
        return res.status(200).send({message:"suceess", data:users})
    }
}

// export function getUserById(req:Request,res:Response){

//     res.send({})
// }

// export function createUser(req:Request<{},{}, createUserDto>,res:Response<User>){
  

//     res.status(201).send({email:"",id:1,username:""})
// }