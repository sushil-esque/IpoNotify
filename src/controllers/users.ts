import { Request, Response } from "express-serve-static-core";
import { createUserDto } from "../dtos/CreateUser.dto";
import { User } from "../types/response";

export function getUsers(req:Request,res:Response){
    res.send(["helloo","fun"])
}

export function getUserById(req:Request,res:Response){

    res.send({})
}

export function createUser(req:Request<{},{}, createUserDto>,res:Response<User>){
    req.body.email;

    res.status(201).send({email:"",id:1,username:""})
}