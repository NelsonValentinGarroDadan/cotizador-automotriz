import z from "zod";
import { Company } from "./compay";
import { PlanVersion } from "./plan";
import { User } from "./user";

export interface Quotation {
  id: string;
  clientName: string;
  clientDni: string;
  totalValue?: number;
  createdAt: string;
  company: Company;
  planVersionId: string;
  user: User;
  planVersion: PlanVersion;
  vehicleVersion?: {
    idversion: number;
    descrip: string;
    nueva_descrip: string;
    codigo: string;
    marca?: { idmarca: number; descrip: string };
    modelo?: { idmodelo: number; descrip: string };
  };
}

export const numberFromString = z
  .union([z.string(), z.number()])
  .transform((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  })
  .optional();

export const createSchema = z.object({
  companyId: z.uuid("Compañia invalida"),
  planId: z.uuid("Plan invalido"),
  planVersionId: z.uuid("Version invalida"),
  clientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientDni: z.string().min(7, "Minimo 7 caracteres"),
  vehicleVersionId: z.coerce
    .number()
    .int("ID de vehiculo invalido")
    .positive("ID de vehiculo invalido"),
  totalValue: numberFromString,
});

export const updateSchema = createSchema.partial();
export type updateSchema = z.infer<typeof updateSchema>;

export type CreateInput = {
  companyId: string;
  planId: string;
  planVersionId: string;
  clientName: string;
  clientDni: string;
  vehicleVersionId: unknown;
  totalValue?: string | number | undefined;
};

export type UpdateInput = Partial<CreateInput>;
