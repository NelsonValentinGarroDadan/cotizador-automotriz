import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { validateRequest } from "../../core/middleware/validateRequest";
import * as controller from "./controller";
import {
  createVehicleVersionSchema,
  updateVehicleVersionSchema,
} from "./schema";
import { authorizeRole } from "../../core/middleware/authorizeRole";
import { Role } from "../../core/types/role";

const routerVehicules = Router();

routerVehicules.get("/brands",authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), catchAsync(controller.getBrands));
routerVehicules.post("/brands", authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]),catchAsync(controller.createBrand));
routerVehicules.put("/brands/:idmarca", authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]),catchAsync(controller.updateBrand));
routerVehicules.delete("/brands/:idmarca", authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]),catchAsync(controller.deleteBrand));
routerVehicules.get("/lines", authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]),catchAsync(controller.getLines));
routerVehicules.post("/lines", authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]),catchAsync(controller.createLine));
routerVehicules.put("/lines/:idlinea",authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), catchAsync(controller.updateLine));
routerVehicules.delete("/lines/:idlinea",authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), catchAsync(controller.deleteLine));
routerVehicules.get("/models",authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), catchAsync(controller.getModels));
routerVehicules.post("/models",authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), catchAsync(controller.createModel));
routerVehicules.put("/models/:idmodelo",authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), catchAsync(controller.updateModel));
routerVehicules.delete("/models/:idmodelo",authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]), catchAsync(controller.deleteModel));
routerVehicules.get("/versions/:idversion", catchAsync(controller.getVersionById));
routerVehicules.get("/versions", catchAsync(controller.getVersions));
routerVehicules.post(
  "/versions",
  authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(createVehicleVersionSchema),
  catchAsync(controller.createVersion)
);
routerVehicules.put(
  "/versions/:idversion",
  authorizeRole([Role.ADMIN, Role.SUPER_ADMIN]),
  validateRequest(updateVehicleVersionSchema),
  catchAsync(controller.updateVersion)
);
routerVehicules.delete("/versions/:idversion", catchAsync(controller.deleteVersion));

export default routerVehicules;
