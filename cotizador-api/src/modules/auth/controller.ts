import { Request, Response } from "express";
import * as service from "./service"; 

export const login  = async (req: Request, res: Response) => { 
    const result = await service.login(req.body);
    res.json(result); 
};
