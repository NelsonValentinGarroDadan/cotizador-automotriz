import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { validateRequest } from "../../core/middleware/validateRequest";
import { loginSchema } from "./schema";
import * as controller from "./controller";

const routerLogin= Router(); 

routerLogin.post('/login', validateRequest(loginSchema),catchAsync(controller.login));

export default routerLogin;