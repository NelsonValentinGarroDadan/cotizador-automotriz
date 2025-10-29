import {  Router } from "express";
import { catchAsync } from "../../utils/catchAsync"; 
import { validateRequest } from "../../core/middleware/validateRequest";
import * as controller from "./controller";
import { createUserSchema, updateUserSchema } from "./schema";

const routerUsers = Router(); 

routerUsers.get('/', catchAsync(controller.getAllUsers));
routerUsers.get('/:id', catchAsync(controller.getUserById));
routerUsers.post('/', validateRequest(createUserSchema), catchAsync(controller.createUser));
routerUsers.put('/:id', validateRequest(updateUserSchema), catchAsync(controller.updateUser));
routerUsers.delete('/:id', catchAsync(controller.deleteUser));


export default routerUsers;