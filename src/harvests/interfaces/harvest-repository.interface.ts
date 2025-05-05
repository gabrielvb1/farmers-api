import { Harvest } from '@prisma/client';
import { CreateHarvestDto } from '../dto/create-harvest.dto';
import { UpdateHarvestDto } from '../dto/update-harvest.dto';

export interface IHarvestRepository {
  create(createHarvestDto: CreateHarvestDto): Promise<Harvest>;
  findOne(createHarvestDto: CreateHarvestDto): Promise<Harvest | null>;
  findById(id: number): Promise<Harvest | null>;
  update(id: number, updateFarmerDto: UpdateHarvestDto): Promise<Harvest>;
  remove(id: number): Promise<Harvest>;
}
