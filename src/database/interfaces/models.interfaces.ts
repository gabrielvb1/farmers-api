export interface IProperty {
  id: number;
  farmer_id: number;
  property_name: string;
  city: string;
  uf: string;
  total_area: number;
  agricultural_area: number;
  vegetation_area: number;
  harvests: IHarvest[];
}

export interface IHarvest {
  id: number;
  property_id: number;
  year: number;
  crops: ICrop[];
}

export interface ICrop {
  id: number;
  harvest_id: number;
  name: string;
}

export interface IFarmerWithRelations {
  id: number;
  name: string;
  cpf_cnpj: string;
  farms: IProperty[];
}
