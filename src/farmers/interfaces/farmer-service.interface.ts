import { CreateFarmerDto } from '../dto/create-farmer.dto';
import { UpdateFarmerDto } from '../dto/update-farmer.dto';
import { Farmer } from '@prisma/client';

export interface IFarmerService {
  validateFarmer(farmerDto: CreateFarmerDto): Promise<void>;
  validateUpdate(id: number, updateFarmerDto: UpdateFarmerDto): Promise<void>;
  create(createFarmerDto: CreateFarmerDto): Promise<Farmer>;
  findAll(): Promise<Farmer[]>;
  findOne(id: number): Promise<Farmer | null>;
  update(id: number, updateFarmerDto: UpdateFarmerDto): Promise<Farmer>;
  remove(id: number): Promise<Farmer>;
}
