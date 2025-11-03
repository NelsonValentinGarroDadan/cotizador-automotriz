import { Router } from "express";
import routerUsers from "../modules/users/routes";
import routerLogin from "../modules/auth/routes";
import  authenticate  from "../core/middleware/authMiddleware";
import routerCompanies from "../modules/companies/routes";


const router = Router();

router.use('/auth',routerLogin);

router.use(authenticate);

router.use('/users',routerUsers);

router.use('/companies',routerCompanies);

export default router;