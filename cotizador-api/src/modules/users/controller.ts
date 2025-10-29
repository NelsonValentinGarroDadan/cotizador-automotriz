import { Request, Response } from "express";
import * as service from "./service";

export const getAllUsers = async (req:Request, res:Response) => {
    const users = await service.getAllUsers();
    res.json(users);
}

export const getUserById = async (req:Request, res:Response) => {
    const user = await service.getUserById(req.params.id);
    res.json(user);
}

export const createUser = async (req:Request, res:Response) => {
    const user = await service.createUser(req.body);
    res.status(201).json(user);
}

export const updateUser = async (req:Request, res:Response) => {
    await service.updateUser(req.params.id, req.body);
    res.status(200).send();
}

export const deleteUser = async (req:Request, res:Response) => {
    await service.deleteUser(req.params.id);
    res.status(200).send();
}