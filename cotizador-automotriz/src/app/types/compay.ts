import { Plan } from "./plan"; 
import { UserCompany } from "./user";
 
import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  logo: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
  logo: z.string().optional(), 
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;


export interface Company {
  id: string;
  name: string;
  logo: string | null;  
  createdAt: string;
  updatedAt: string;
}

// Compañía con relaciones
export interface CompanyWithOwner extends Company {
 userCompanies?: UserCompany[]
}

export interface CompanyWithPlans extends Company {
  plans: Plan[];
}

export interface CreateCompanyDto {
  name: string;
  logo?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  logo?: string;
  active?: boolean;
}