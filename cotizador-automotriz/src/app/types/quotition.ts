import { z } from "zod";
import { Role } from ".";

export interface QuotationFull {
  id: string;
  planVersionId: string;
  companyId: string;
  userId: string;
  clientName: string;
  clientDni: string;
  vehicleVersionId: number;
  totalValue: number;
  createdAt: string;
  planVersion: {
    id: string;
    plan?: { id: string; name: string };
    version: number;
    coefficients: { id: string; plazo: number; tna: string; coeficiente: string; cuotaBalon: string | null; cuotaPromedio: string | null }[];
  };
  company: { id: string; name: string };
  user: { id: string; firstName: string; lastName: string; role: Role };
  vehicleVersion?: {
    idversion: number;
    descrip: string;
    codigo: string;
    marca?: { idmarca: number; descrip: string } | null;
    linea?: { idlinea: number; descrip: string } | null;
  };
}

export const quotationSchema = z.object({
  planVersionId: z.string().uuid("El plan es obligatorio"),
  companyId: z.string().uuid("La compania es obligatoria"),
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientDni: z.string().regex(/^\d+$/, "El DNI debe contener solo numeros").min(7, "El DNI debe tener al menos 7 digitos").max(10, "El DNI no puede exceder los 10 digitos"),
  vehicleVersionId: z.coerce.number().int("ID de vehiculo invalido").positive("ID de vehiculo invalido"),
  totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
