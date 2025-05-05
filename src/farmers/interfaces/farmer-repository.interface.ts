import { CreateFarmerDto } from '../dto/create-farmer.dto';
import { Farmer } from '@prisma/client';
import { UpdateFarmerDto } from '../dto/update-farmer.dto';

export interface IFarmerRepository {
  create(createFarmerDto: CreateFarmerDto): Promise<Farmer>;
  findByCpfCnpj(cpf_cnpj: string): Promise<Farmer | null>;
  findAll(): Promise<Farmer[]>;
  findFarmer(id: number): Promise<Farmer | null>;
  updateFarmer(
    updateFarmerDto: UpdateFarmerDto,
    id: number,
  ): Promise<Farmer | null>;

  deleteFarmer(id: number): Promise<Farmer | null>;
}
