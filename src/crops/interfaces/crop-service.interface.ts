import { CreateCropDto } from '../dto/create-crop.dto';
import { UpdateCropDto } from '../dto/update-crop.dto';
import { Crop } from '@prisma/client';

export interface ICropService {
  validateCreate(createCropDto: CreateCropDto): Promise<void>;
  validateUpdate(id: number, updateCropDto: UpdateCropDto): Promise<void>;
  validateDelete(id: number): Promise<void>;
  create(createCropDto: CreateCropDto): Promise<Crop>;
  update(id: number, updateCropDto: UpdateCropDto): Promise<Crop>;
  remove(id: number): Promise<Crop>;
}
