import { Router } from "express";
import routerUsers from "../modules/users/routes";
import routerLogin from "../modules/auth/routes";
import  authenticate  from "../core/middleware/authMiddleware";
import routerCompanies from "../modules/companies/routes";
import routerPlans from "../modules/plans/routes";


const router = Router();

router.use('/auth',routerLogin);

router.use(authenticate);

router.use('/users',routerUsers);

router.use('/companies',routerCompanies);

router.use('/plans',routerPlans)

export default router;