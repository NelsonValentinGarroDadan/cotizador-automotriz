// backend/src/modules/plan/routes.ts
import { Router } from "express";
import * as controller from "./controller"; 
import { createPlanSchema, updatePlanWithVersionSchema } from "./schema"; 
import { authorizeRole } from "../../core/middleware/authorizeRole"; 
import { Role } from "../../core/types/role";
import { validateRequest } from "../../core/middleware/validateRequest";
import { uploadLogo } from "../../core/middleware/uploadLogo";

const routerPlans = Router();
 

routerPlans.get("/", controller.getAllPlans);
routerPlans.get("/:id", controller.getPlanById);
routerPlans.post(
  "/",
  authorizeRole([Role.ADMIN]),
  uploadLogo.single("logo"),
  validateRequest(createPlanSchema),
  controller.createPlan
);
routerPlans.put(
  "/:id",
  authorizeRole([Role.ADMIN]),
  uploadLogo.single("logo"),
  validateRequest(updatePlanWithVersionSchema),
  controller.updatePlan
);
routerPlans.delete("/:id",authorizeRole([Role.ADMIN]), controller.deletePlan);

export default routerPlans;
