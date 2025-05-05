import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { Crop } from '@prisma/client';
import { ICropService } from './interfaces/crop-service.interface';
import { ICropRepository } from './interfaces/crop-repository.interface';
import { IHarvestRepository } from 'src/harvests/interfaces/harvest-repository.interface';

@Injectable()
export class CropsService implements ICropService {
  constructor(
    @Inject('CROP_REPOSITORY') private readonly cropRepository: ICropRepository,
    @Inject('HARVEST_REPOSITORY')
    private readonly harvestRepository: IHarvestRepository,
  ) {}

  async validateCreate(createCropDto: CreateCropDto): Promise<void> {
    const harvest = await this.harvestRepository.findById(
      createCropDto.harvest_id,
    );
    if (!harvest) {
      throw new BadRequestException('Safra não encontrada');
    }
  }
  async validateUpdate(
    id: number,
    updateCropDto: UpdateCropDto,
  ): Promise<void> {
    const existingCrop = await this.cropRepository.findById(id);
    if (!existingCrop) {
      throw new NotFoundException('Cultura não encontrada');
    }

    if (updateCropDto.harvest_id !== undefined) {
      const harvest = await this.harvestRepository.findById(
        updateCropDto.harvest_id,
      );
      if (!harvest) {
        throw new BadRequestException('Safra não encontrada');
      }
    }
  }

  async validateDelete(id: number): Promise<void> {
    const existingCrop = await this.cropRepository.findById(id);
    if (!existingCrop) {
      throw new NotFoundException('Cultura não encontrada');
    }
  }

  async create(createCropDto: CreateCropDto): Promise<Crop> {
    const harvest = await this.harvestRepository.findById(
      createCropDto.harvest_id,
    );
    if (!harvest) {
      throw new BadRequestException('Safra não encontrada');
    }

    return this.cropRepository.create(createCropDto);
  }

  async update(id: number, updateCropDto: UpdateCropDto): Promise<Crop> {
    const existingCrop = await this.cropRepository.findById(id);
    if (!existingCrop) {
      throw new NotFoundException('Cultura não encontrada');
    }

    if (updateCropDto.harvest_id) {
      const harvest = await this.harvestRepository.findById(
        updateCropDto.harvest_id,
      );
      if (!harvest) {
        throw new BadRequestException('Safra não encontrada');
      }
    }

    return this.cropRepository.update(id, updateCropDto);
  }

  async remove(id: number): Promise<Crop> {
    const existingCrop = await this.cropRepository.findById(id);
    if (!existingCrop) {
      throw new NotFoundException('Cultura não encontrada');
    }

    return this.cropRepository.remove(id);
  }
}
