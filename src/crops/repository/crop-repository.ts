import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCropDto } from '../dto/create-crop.dto';
import { UpdateCropDto } from '../dto/update-crop.dto';
import { Crop } from '@prisma/client';
import { ICropRepository } from '../interfaces/crop-repository.interface';

@Injectable()
export class CropRepository implements ICropRepository {
  constructor(private prisma: PrismaService) {}

  async create(createCropDto: CreateCropDto): Promise<Crop> {
    return this.prisma.crop.create({
      data: createCropDto,
    });
  }

  async findById(id: number): Promise<Crop | null> {
    return this.prisma.crop.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateCropDto: UpdateCropDto): Promise<Crop> {
    return this.prisma.crop.update({
      where: { id },
      data: updateCropDto,
    });
  }

  async remove(id: number): Promise<Crop> {
    return this.prisma.crop.delete({
      where: { id },
    });
  }
}
