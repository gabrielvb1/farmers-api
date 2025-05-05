import { CreatePropertyDto } from '../dto/create-property.dto';
import { Property } from '@prisma/client';
import { UpdatePropertyDto } from '../dto/update-property.dto';

export interface IPropertyService {
  validateCreate(createPropertyDto: CreatePropertyDto): Promise<void>;
  validateUpdate(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<void>;
  validateDelete(id: number): Promise<void>;
  create(createPropertyDto: CreatePropertyDto): Promise<Property>;
  findAll(): Promise<number>;
  findTotalArea(): Promise<number>;
  findByState(state: string): Promise<Property[] | null>;
  update(id: number, updatePropertyDto: UpdatePropertyDto): Promise<Property>;
  remove(id: number): Promise<Property>;
}
