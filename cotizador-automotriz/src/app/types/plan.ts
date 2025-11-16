// app/types/plan.ts
import { z } from 'zod';
import { User } from './user';
import { Company } from './compay';

// ==================== INTERFACES ====================

export interface CuotaBalonMonth {
  id: string;
  month: number;
}

export interface PlanCoefficient {
  id: string;
  plazo: number;
  tna: number;
  coeficiente: number;
  quebrantoFinanciero: number;
  cuotaBalon?: number | null;
  cuotaPromedio?: number | null;
  cuotaBalonMonths: CuotaBalonMonth[];
}

export interface PlanVersion {
  id: string;
  version: number;
  isLatest: boolean;
  createdAt: string;
  desdeMonto?: number | null;
  hastaMonto?: number | null;
  desdeCuota?: number | null;
  hastaCuota?: number | null;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  coefficients: PlanCoefficient[];
  plan:Plan;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  active: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  companies?: Company[];
  createdBy?: User;
  _count?: {
    versions: number;
  };
}

export interface PlanWithDetails extends Plan {
  allowedUsers: User[];
  companies: Company[];
  createdBy: User;
  versions?: PlanVersion[];
}

// ==================== ZOD SCHEMAS ====================

export const coefficientSchema = z.object({
  plazo: z.coerce.number().int().min(1, 'El plazo debe ser mayor a 0'),
  tna: z.coerce.number().nonnegative('La TNA debe ser positiva'),
  coeficiente: z.coerce.number().nonnegative('El coeficiente debe ser positivo'),
  quebrantoFinanciero: z.coerce.number().nonnegative('El quebranto debe ser positivo').optional(),
  cuotaBalon: z.coerce.number().optional(),
  cuotaPromedio: z.coerce.number().optional(),
  cuotaBalonMonths: z.array(z.coerce.number().int()).optional(),
});

// ✅ Helper para transformar valores vacíos a undefined
const optionalPositiveNumber = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? undefined : num;
  })
  .refine((val) => val === undefined || val >= 0, {
    message: 'Debe ser un número positivo',
  })
  .optional();

const optionalPositiveInteger = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = typeof val === 'string' ? parseInt(val) : val;
    return isNaN(num) ? undefined : num;
  })
  .refine((val) => val === undefined || val > 0, {
    message: 'Debe ser un número positivo',
  })
  .optional();

export const createPlanSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().max(1000, 'La descripción no puede superar los 1000 caracteres').optional(),
  companyIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una compañía'),
  desdeMonto: optionalPositiveNumber,
  hastaMonto: optionalPositiveNumber,
  desdeCuota: optionalPositiveInteger,
  hastaCuota: optionalPositiveInteger,
  coefficients: z.array(coefficientSchema).min(1, 'Debe incluir al menos un coeficiente'),
  allowedUserIds: z.array(z.uuid()).optional(), 
}).refine(
  (data) => {
    if (data.desdeMonto !== undefined && data.hastaMonto !== undefined) {
      return data.desdeMonto <= data.hastaMonto;
    }
    return true;
  },
  {
    message: 'El monto "desde" debe ser menor o igual al monto "hasta"',
    path: ['hastaMonto'],
  }
).refine(
  (data) => {
    if (data.desdeCuota !== undefined && data.hastaCuota !== undefined) {
      return data.desdeCuota <= data.hastaCuota;
    }
    return true;
  },
  {
    message: 'La cuota "desde" debe ser menor o igual a la cuota "hasta"',
    path: ['hastaCuota'],
  }
);

export const updatePlanSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().max(1000).optional(),
  companyIds: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  desdeMonto: optionalPositiveNumber,
  hastaMonto: optionalPositiveNumber,
  desdeCuota: optionalPositiveInteger,
  hastaCuota: optionalPositiveInteger,
  coefficients: z.array(coefficientSchema).optional(),
  allowedUserIds: z.array(z.uuid()).optional(), 
});


export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CoefficientInput = z.infer<typeof coefficientSchema>;