// app/types/user.ts
import { z } from 'zod';
import { Role } from "."; 
import { Company } from './compay';
import { Plan } from './plan';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithCompanies extends User {
  companies?: UserCompany[];  
  allowedPlans?: Plan[]
}


export interface UserCompany {
  id: string;
  userId: string;
  companyId: string;
  createdAt: string;
  company?: Company;
  user?: User;  
}


// ✅ Schema de validación para crear admin
export const createAdminSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  companyIds: z.array(z.string()).optional(),
  allowedPlanIds: z.array(z.string()).optional().default([]),
});


// ✅ Schema para editar (sin password obligatorio)
export const updateAdminSchema = z.object({
  email: z.email('Email inválido').optional(),
  password: z.string().optional(),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').optional(),
  companyIds: z.array(z.string()).optional(),
  allowedPlanIds: z.array(z.string()).optional(),
});


export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;

// Tipos existentes...
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  companyIds?: string[]; // ✅ Agregar
}

export interface UpdateUserDto {
  email?: string;
  password?: string; // ✅ Agregar
  firstName?: string;
  lastName?: string;
  role?: Role;
  companyIds?: string[]; // ✅ Agregar
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}