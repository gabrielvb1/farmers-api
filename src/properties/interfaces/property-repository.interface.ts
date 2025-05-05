import { Farmer, Property } from '@prisma/client';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';

export interface IPropertyRepository {
  create(createPropertyDto: CreatePropertyDto): Promise<Property>;
  findAll(): Promise<Property[]>;
  findFarmer(id: number): Promise<Farmer | null>;
  findProperty(id: number): Promise<Property | null>;
  findPropertiesByState(state: string): Promise<Property[] | null>;
  updateProperty(
    updatePropertyDto: UpdatePropertyDto,
    id: number,
  ): Promise<Property | null>;

  deleteProperty(id: number): Promise<Property | null>;
}
