export interface VehiculeVersionPayload {
  lineId?: number;
  brandId?: number;
  descrip: string;
  codigo: string;
  companyIds: string[];
  newBrandDescrip?: string;
  newLineDescrip?: string;
}

export interface VehiculeLine {
  idlinea: number;
  descrip: string;
}
 

export interface VehiculeVersion {
  idversion: number;
  descrip: string;
  codigo: string;
  marca?: { idmarca: number; descrip: string } | null;
  linea?: VehiculeLine | null; 
  company?: { id: string; name: string }[];
}
