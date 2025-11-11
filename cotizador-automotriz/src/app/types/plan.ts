// app/types/plan.ts
import { z } from 'zod'; 
import { User } from './user';
import { Company } from './compay';

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  companyId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  createdBy?: User;
  _count?: {
    versions: number;
  };
}

export interface PlanWithDetails extends Plan { 
  createdBy:User;
  versions?: {
    id: string;
    version: number;
    isLatest: boolean;
    createdAt: string;
    createdBy: {
      firstName: string;
      lastName: string;
    };
  }[];
}

export const createPlanSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().max(1000).optional(),
  companyId: z.string().min(1, 'Debe seleccionar una compañía'),
});

export const updatePlanSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().max(1000).optional(),
  companyId: z.string().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;