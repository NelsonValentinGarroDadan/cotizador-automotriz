import { Router } from "express";
import routerUsers from "../modules/users/routes";
import routerLogin from "../modules/auth/routes";
import  authenticate  from "../core/middleware/authMiddleware";
import routerCompanies from "../modules/companies/routes";
import routerPlans from "../modules/plans/routes";
import quotationRoutes from "../modules/qoutation/routes";
import vehiculesRoutes from "../modules/vehicules/routes";
import { authorizeRole } from "../core/middleware/authorizeRole";
import { Role } from "../core/types/role";


const router = Router();

router.use('/auth',routerLogin);

router.use(authenticate);

router.use('/users',authorizeRole([Role.SUPER_ADMIN,Role.ADMIN]),routerUsers);

router.use('/companies',authorizeRole([Role.SUPER_ADMIN]),routerCompanies);

router.use('/plans',routerPlans);

router.use('/quotations', quotationRoutes);

router.use('/vehicules', authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), vehiculesRoutes);

export default router;
