import { Company } from "./compay";
import { PlanVersion } from "./plan";
import { User } from "./user";

export interface Quotation {
  id: string;
  planVersionId: string;
  companyId: string;
  userId: string;
  clientName: string;
  clientDni: string;
  vehicleData: string | null;
  totalValue: string | null; // Decimal viene como string
  createdAt: string;
}

export interface QuotationWithDetails extends Quotation {
  planVersion: PlanVersion;
  company: Company;
  user: User;
}
