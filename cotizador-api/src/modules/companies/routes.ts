import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { validateRequest } from "../../core/middleware/validateRequest";
import { uploadLogo } from "../../core/middleware/uploadLogo"; 
import * as controller from "./controller";
import { createCompanyValidation, updateCompanySchema } from "./schema";

const routerCompanies = Router();

routerCompanies.get("/", catchAsync(controller.getAllCompanies));
routerCompanies.get("/:id", catchAsync(controller.getCompanyById));
routerCompanies.post(
  "/",
  uploadLogo.single("logo"),
  validateRequest(createCompanyValidation ),
  catchAsync(controller.createCompany)
);
routerCompanies.put(
  "/:id",
  uploadLogo.single("logo"),
  validateRequest(updateCompanySchema),
  catchAsync(controller.updateCompany)
);
routerCompanies.delete(
  "/:id",
  catchAsync(controller.deleteCompany)
);

export default routerCompanies;
