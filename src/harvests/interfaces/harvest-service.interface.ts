import { Harvest } from '@prisma/client';
import { CreateHarvestDto } from '../dto/create-harvest.dto';
import { UpdateHarvestDto } from '../dto/update-harvest.dto';

export interface IHarvestService {
  validateCreate(createHarvestDto: CreateHarvestDto): Promise<void>;
  validateUpdate(id: number, updateHarvestDto: UpdateHarvestDto): Promise<void>;
  validateDelete(id: number): Promise<void>;
  create(createHarvestDto: CreateHarvestDto): Promise<Harvest>;
  update(id: number, updateHarvestDto: UpdateHarvestDto): Promise<Harvest>;
  remove(id: number): Promise<Harvest>;
}
