import { Router } from "express";
import routerUsers from "../modules/users/routes";
import routerLogin from "../modules/auth/routes";
import  authenticate  from "../core/middleware/authMiddleware";


const router = Router();

router.use('/auth',routerLogin);

router.use(authenticate);

router.use('/users',routerUsers);

export default router;