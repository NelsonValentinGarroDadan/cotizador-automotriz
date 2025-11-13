import z from "zod";
import { Company } from "./compay";
import {  PlanVersion } from "./plan";
import { User } from "./user";

export interface Quotation {
  id: string;
  clientName: string;
  clientDni: string;
  vehicleData?: string;
  totalValue?: number;
  createdAt: string;
  company: Company;
  planVersionId:string;
  user: User;
  planVersion: PlanVersion;
}

// 🧩 Este tipo acepta string o number, perfecto para inputs controlados
export const numberFromString = z
  .union([z.string(), z.number()])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  })
  .optional();

// 🧩 Schema de creación
export const createSchema = z.object({
  companyId: z.uuid("Compañía inválida"),
  planId: z.uuid("Plan inválido"),
  planVersionId: z.uuid("Versión inválida"),
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientDni: z.string().min(7, "Mínimo 7 caracteres"),
  vehicleData: z.string().optional(),
  totalValue: numberFromString,
});

// 🧩 Schema de actualización parcial
export const updateSchema = createSchema.partial();
export type updateSchema = z.infer<typeof updateSchema>

// ✅ Tipos inferidos compatibles con react-hook-form
export type CreateInput = {
  companyId: string;
  planId: string;
  planVersionId: string;
  clientName: string;
  clientDni: string;
  vehicleData?: string;
  totalValue?: string | number | undefined;
};

export type UpdateInput = Partial<CreateInput>;
