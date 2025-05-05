import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { IHarvestService } from './interfaces/harvest-service.interface';
import { IHarvestRepository } from './interfaces/harvest-repository.interface';
import { IPropertyRepository } from 'src/properties/interfaces/property-repository.interface';
import { Harvest } from '@prisma/client';

@Injectable()
export class HarvestsService implements IHarvestService {
  constructor(
    @Inject('HARVEST_REPOSITORY') private harvestRepository: IHarvestRepository,
    @Inject('PROPERTY_REPOSITORY')
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async validateCreate(createHarvestDto: CreateHarvestDto): Promise<void> {
    const currentYear = new Date().getUTCFullYear();
    if (createHarvestDto.year > currentYear) {
      throw new BadRequestException('Insira um ano menor que o atual');
    }

    const property = await this.propertyRepository.findProperty(
      createHarvestDto.property_id,
    );
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }

    const existingHarvest =
      await this.harvestRepository.findOne(createHarvestDto);
    if (existingHarvest) {
      throw new BadRequestException(
        'Ano da colheita já cadastrado para essa propriedade',
      );
    }
  }
  async validateUpdate(
    id: number,
    updateHarvestDto: UpdateHarvestDto,
  ): Promise<void> {
    const existingHarvest = await this.harvestRepository.findById(id);
    if (!existingHarvest) {
      throw new NotFoundException('Colheita não encontrada');
    }

    if (updateHarvestDto.property_id !== undefined) {
      const property = await this.propertyRepository.findProperty(
        updateHarvestDto.property_id,
      );
      if (!property) {
        throw new NotFoundException('Propriedade não encontrada');
      }
    }

    if (
      updateHarvestDto.property_id !== undefined &&
      updateHarvestDto.year !== undefined
    ) {
      const conflictingHarvest = await this.harvestRepository.findOne({
        property_id: updateHarvestDto.property_id,
        year: updateHarvestDto.year,
      });
      if (conflictingHarvest && conflictingHarvest.id !== id) {
        throw new BadRequestException(
          'Ano da colheita já cadastrado para essa propriedade',
        );
      }
    }
  }

  async validateDelete(id: number): Promise<void> {
    const existingHarvest = await this.harvestRepository.findById(id);
    if (!existingHarvest) {
      throw new NotFoundException('Colheita não encontrada');
    }
  }
  async create(createHarvestDto: CreateHarvestDto): Promise<Harvest> {
    const currentYear = new Date().getUTCFullYear();

    if (createHarvestDto.year > currentYear) {
      throw new BadRequestException({
        message: 'Insira um ano menor que o atual',
      });
    }
    const property = await this.propertyRepository.findProperty(
      createHarvestDto.property_id,
    );
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }

    const existingHarvest =
      await this.harvestRepository.findOne(createHarvestDto);
    if (existingHarvest) {
      throw new BadRequestException(
        'Ano da colheita já cadastrado para essa propriedade',
      );
    }

    return this.harvestRepository.create(createHarvestDto);
  }

  async update(
    id: number,
    updateHarvestDto: UpdateHarvestDto,
  ): Promise<Harvest> {
    const existingHarvest = await this.harvestRepository.findById(id);
    if (!existingHarvest) {
      throw new NotFoundException('Colheita não encontrada');
    }

    if (updateHarvestDto.property_id) {
      const property = await this.propertyRepository.findProperty(
        updateHarvestDto.property_id,
      );
      if (!property) {
        throw new NotFoundException('Propriedade não encontrada');
      }
    }

    if (updateHarvestDto.property_id && updateHarvestDto.year) {
      const conflictingHarvest = await this.harvestRepository.findOne({
        property_id: updateHarvestDto.property_id,
        year: updateHarvestDto.year,
      });
      if (conflictingHarvest && conflictingHarvest.id !== id) {
        throw new BadRequestException(
          'Ano da colheita já cadastrado para essa propriedade',
        );
      }
    }

    return this.harvestRepository.update(id, updateHarvestDto);
  }

  async remove(id: number): Promise<Harvest> {
    const existingHarvest = await this.harvestRepository.findById(id);
    if (!existingHarvest) {
      throw new NotFoundException('Colheita não encontrada');
    }

    return this.harvestRepository.remove(id);
  }
}
