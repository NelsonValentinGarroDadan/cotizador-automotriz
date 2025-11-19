import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import * as controller from "./controller";

const routerVehicules = Router();

routerVehicules.get("/brands", catchAsync(controller.getBrands));
routerVehicules.post("/brands", catchAsync(controller.createBrand));
routerVehicules.put("/brands/:idmarca", catchAsync(controller.updateBrand));
routerVehicules.delete("/brands/:idmarca", catchAsync(controller.deleteBrand));
routerVehicules.get("/lines", catchAsync(controller.getLines));
routerVehicules.post("/lines", catchAsync(controller.createLine));
routerVehicules.put("/lines/:idlinea", catchAsync(controller.updateLine));
routerVehicules.delete("/lines/:idlinea", catchAsync(controller.deleteLine));
routerVehicules.get("/models", catchAsync(controller.getModels));
routerVehicules.post("/models", catchAsync(controller.createModel));
routerVehicules.put("/models/:idmodelo", catchAsync(controller.updateModel));
routerVehicules.delete("/models/:idmodelo", catchAsync(controller.deleteModel));
routerVehicules.get("/versions/:idversion", catchAsync(controller.getVersionById));
routerVehicules.get("/versions", catchAsync(controller.getVersions));
routerVehicules.post("/versions", catchAsync(controller.createVersion));
routerVehicules.put("/versions/:idversion", catchAsync(controller.updateVersion));
routerVehicules.delete("/versions/:idversion", catchAsync(controller.deleteVersion));

export default routerVehicules;
