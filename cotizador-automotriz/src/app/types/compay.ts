import { Plan } from "./plan";
import { User } from "./user";

 

export interface Company {
  id: string;
  name: string;
  logo: string | null;
  active: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Compañía con relaciones
export interface CompanyWithOwner extends Company {
  owner: User;
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