/* eslint-disable @typescript-eslint/no-explicit-any */
import { Company } from "./compay";
import { User } from "./user";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  createdById: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanWithVersions extends Plan {
  versions: PlanVersion[];
}

export interface PlanWithCompany extends Plan {
  company: Company;
  createdBy: User;
}

export interface PlanVersion {
  id: string;
  planId: string;
  version: number;
  coefficients: Record<string, any>; 
  createdAt: string;
}

export interface PlanVersionWithPlan extends PlanVersion {
  plan: Plan;
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  companyId: string;
}

export interface CreatePlanVersionDto {
  planId: string;
  coefficients: Record<string, any>;
}

export interface CreateQuotationDto {
  planVersionId: string;
  companyId: string;
  clientName: string;
  clientDni: string;
  vehicleData?: string;
  totalValue?: number;
}
