import { z } from "zod";
import { Company } from "./compay";
import { User } from "./user";
import { VehiculeVersion } from "./vehiculos";

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
    isLatest?: boolean; 
    versionNumber?: number;
    createdAt?: string;
    plan?: { id: string; name: string; logo?: string | null };
    version: number;
    coefficients: { id: string; plazo: number; tna: string; coeficiente: string; cuotaBalon: string | null; cuotaPromedio: string | null }[];
  };
  company: Company;
  user: User;
  vehicleVersion?: VehiculeVersion;
}

export const quotationSchema = z.object({
  planVersionId: z.string().uuid("El plan es obligatorio"),
  companyId: z.string().uuid("La compañia es obligatoria"),
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientDni: z.string().regex(/^\d+$/, "El DNI debe contener solo numeros").min(7, "El DNI debe tener al menos 7 digitos").max(10, "El DNI no puede exceder los 10 digitos"),
  vehicleVersionId: z.coerce.number().int("ID de vehiculo invalido").positive("ID de vehiculo invalido"),
  totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
});

export type QuotationInput = z.infer<typeof quotationSchema>;

export const createSchema = z.object({
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientDni: z.string().regex(/^\d+$/, "El DNI debe contener solo numeros").min(7, "El DNI debe tener al menos 7 digitos").max(10, "El DNI no puede exceder los 10 digitos"),
  totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
  companyId: z.string().uuid("La compañia es obligatoria"),
  planId: z.string().uuid("El plan es obligatorio"),
  planVersionId: z.string().uuid("La version del plan es obligatoria"),
  vehicleVersionId: z.coerce.number().int("ID de vehiculo invalido").positive("ID de vehiculo invalido"),
});

export type CreateInput = z.infer<typeof createSchema>;
export type Quotation = QuotationFull;
