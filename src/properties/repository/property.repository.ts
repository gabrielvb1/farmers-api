import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Farmer, Property } from '@prisma/client';
import { IPropertyRepository } from '../interfaces/property-repository.interface';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';

@Injectable()
export class PropertyRepository implements IPropertyRepository {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    return this.prisma.property.create({
      data: {
        property_name: createPropertyDto.property_name,
        city: createPropertyDto.city,
        uf: createPropertyDto.uf.toUpperCase(),
        total_area: createPropertyDto.total_area,
        agricultural_area: createPropertyDto.agricultural_area,
        vegetation_area: createPropertyDto.vegetation_area,
        farmer_id: createPropertyDto.farmer_id,
      },
    });
  }

  async findAll(): Promise<Property[]> {
    return await this.prisma.property.findMany({
      include: {
        harvests: {
          include: {
            crops: true,
          },
        },
      },
    });
  }

  async findProperty(id: number): Promise<Property | null> {
    return await this.prisma.property.findUnique({
      where: { id },
    });
  }

  async findPropertiesByState(state: string): Promise<Property[] | null> {
    return await this.prisma.property.findMany({
      where: { uf: state },
    });
  }

  async findFarmer(id: number): Promise<Farmer | null> {
    return await this.prisma.farmer.findUnique({
      where: { id },
    });
  }

  async updateProperty(
    updatePropertyDto: UpdatePropertyDto,
    id: number,
  ): Promise<Property | null> {
    return await this.prisma.property.update({
      where: { id },
      data: {
        property_name: updatePropertyDto.property_name,
        city: updatePropertyDto.city,
        uf: updatePropertyDto.uf,
        total_area: updatePropertyDto.total_area,
        agricultural_area: updatePropertyDto.agricultural_area,
        vegetation_area: updatePropertyDto.vegetation_area,
        farmer_id: updatePropertyDto.farmer_id,
      },
    });
  }

  async deleteProperty(id: number): Promise<Property | null> {
    return await this.prisma.property.delete({
      where: { id },
    });
  }
}
