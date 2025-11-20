export interface VehiculeVersionPayload {
  lineId?: number;
  brandId?: number;
  modelId?: number;
  descrip: string;
  nueva_descrip?: string;
  codigo?: string;
  companyIds: string[];
  // Campos para creación de nuevas entidades cuando no se seleccionan existentes
  newBrandDescrip?: string;
  newLineDescrip?: string;
  newModelDescrip?: string;
}

export interface VehiculeVersion {
  idversion: number;
  descrip: string;
  nueva_descrip: string;
  codigo: string;
  marca: { idmarca: number; descrip: string };
  modelo: {
    idmodelo: number;
    descrip: string;
    linea?: { idlinea: number; descrip: string };
  };
  company?: { id: string; name: string }[];
}
