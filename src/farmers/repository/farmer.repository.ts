import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateFarmerDto } from '../dto/create-farmer.dto';
import { Farmer } from '@prisma/client';
import { IFarmerRepository } from '../interfaces/farmer-repository.interface';
import { UpdateFarmerDto } from '../dto/update-farmer.dto';

@Injectable()
export class FarmerRepository implements IFarmerRepository {
  constructor(private prisma: PrismaService) {}

  async create(createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    return this.prisma.farmer.create({
      data: {
        name: createFarmerDto.name,
        cpf_cnpj: createFarmerDto.cpf_cnpj,
      },
    });
  }

  async findByCpfCnpj(cpf_cnpj: string): Promise<Farmer | null> {
    return this.prisma.farmer.findUnique({
      where: { cpf_cnpj },
    });
  }

  async findAll(): Promise<Farmer[]> {
    return await this.prisma.farmer.findMany({
      include: {
        farms: {
          include: {
            harvests: {
              include: {
                crops: true,
              },
            },
          },
        },
      },
    });
  }

  async findFarmer(id: number): Promise<Farmer | null> {
    return await this.prisma.farmer.findUnique({
      where: { id },
      include: {
        farms: { include: { harvests: { include: { crops: true } } } },
      },
    });
  }

  async updateFarmer(
    updateFarmerDto: UpdateFarmerDto,
    id: number,
  ): Promise<Farmer | null> {
    return await this.prisma.farmer.update({
      where: { id },
      data: {
        name: updateFarmerDto.name,
        cpf_cnpj: updateFarmerDto.cpf_cnpj,
      },
    });
  }

  async deleteFarmer(id: number): Promise<Farmer | null> {
    return await this.prisma.farmer.delete({
      where: { id },
    });
  }
}
