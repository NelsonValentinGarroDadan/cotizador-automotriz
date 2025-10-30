import { Role  } from ".";
import { Company } from "./compay";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Usuario con relaciones (cuando lo necesites)
export interface UserWithCompanies extends User {
  ownedCompanies?: Company[];
  companies?: UserCompany[];
}

// UserCompany (relación muchos a muchos) 
export interface UserCompany {
  id: string;
  userId: string;
  companyId: string;
  createdAt: string;
}

export interface UserCompanyWithDetails extends UserCompany {
  user: User;
  company: Company;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
