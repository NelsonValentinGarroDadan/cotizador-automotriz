// backend/src/modules/quotation/routes.ts
import { Router } from "express";
import * as controller from "./controller";
import { createQuotationSchema, updateQuotationSchema } from "./schema";
import { authorizeRole } from "../../core/middleware/authorizeRole";
import { Role } from "../../core/types/role";
import { validateRequest } from "../../core/middleware/validateRequest";

const quotationRoutes = Router();

// Todos los usuarios autenticados pueden ver cotizaciones
quotationRoutes.get("/", controller.getAllQuotations);
quotationRoutes.get("/:id", controller.getQuotationById);
 
quotationRoutes.post(
  "/",
  validateRequest(createQuotationSchema),
  controller.createQuotation
);
 
quotationRoutes.put(
  "/:id",
  validateRequest(updateQuotationSchema),
  controller.updateQuotation
);

// Eliminar cotización (solo admins)
quotationRoutes.delete(
  "/:id",
  authorizeRole([Role.ADMIN]),
  controller.deleteQuotation
);

export default quotationRoutes;