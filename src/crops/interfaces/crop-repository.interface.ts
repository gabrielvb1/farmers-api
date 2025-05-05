import { CreateCropDto } from '../dto/create-crop.dto';
import { UpdateCropDto } from '../dto/update-crop.dto';
import { Crop } from '@prisma/client';

export interface ICropRepository {
  create(createCropDto: CreateCropDto): Promise<Crop>;
  findById(id: number): Promise<Crop | null>;
  update(id: number, updateCropDto: UpdateCropDto): Promise<Crop>;
  remove(id: number): Promise<Crop>;
}
