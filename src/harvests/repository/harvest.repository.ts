import { Injectable } from '@nestjs/common';
import { IHarvestRepository } from '../interfaces/harvest-repository.interface';
import { CreateHarvestDto } from '../dto/create-harvest.dto';
import { Harvest } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateHarvestDto } from '../dto/update-harvest.dto';

@Injectable()
export class HarvestRepository implements IHarvestRepository {
  constructor(private prisma: PrismaService) {}

  async create(createHarvestDto: CreateHarvestDto): Promise<Harvest> {
    return this.prisma.harvest.create({
      data: {
        year: createHarvestDto.year,
        property_id: createHarvestDto.property_id,
      },
    });
  }

  async findOne(createHarvestDto: CreateHarvestDto): Promise<Harvest | null> {
    return this.prisma.harvest.findFirst({
      where: {
        year: createHarvestDto.year,
        property_id: createHarvestDto.property_id,
      },
    });
  }

  async findById(id: number): Promise<Harvest | null> {
    return this.prisma.harvest.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    updateFarmerDto: UpdateHarvestDto,
  ): Promise<Harvest> {
    return this.prisma.harvest.update({
      where: { id },
      data: {
        year: updateFarmerDto.year,
        property_id: updateFarmerDto.property_id,
      },
    });
  }

  async remove(id: number): Promise<Harvest> {
    return this.prisma.harvest.delete({
      where: { id },
    });
  }
}
