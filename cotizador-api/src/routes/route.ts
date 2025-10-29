import { Router } from "express";
import routerUsers from "../modules/users/routes";


const router = Router();

router.use('/users',routerUsers);

export default router;