import prisma from "../../config/prisma";
import { CreateUser, UpdateUser } from "./schema";

export const getAllUsers = async () => (
    await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true, 
            createdAt: true,
            updatedAt: true,
        }}
    )
); 

export const getUserById = async (id: string) => (
    await prisma.user.findUnique({ 
        where: { id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        } 
    })
);

export const getUserByEmail = async (email: string) => await prisma.user.findUnique({ where: { email }});

export const createUser = async (data: CreateUser) => (
    await prisma.user.create({ 
        data ,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        } 
    })
); 

export const updateUser = async (id: string, data: UpdateUser) => (
    await prisma.user.update({ 
        where: { id }, 
        data,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        }  
    })
);

export const deleteUser = async (id:string) => await prisma.user.delete({ where: { id } });