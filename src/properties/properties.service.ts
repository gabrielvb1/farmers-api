import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { IPropertyService } from './interfaces/property-service.interface';
import { IPropertyRepository } from './interfaces/property-repository.interface';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from '@prisma/client';

@Injectable()
export class PropertiesService implements IPropertyService {
  constructor(
    @Inject('PROPERTY_REPOSITORY')
    private propertyRepository: IPropertyRepository,
  ) {}

  async validateCreate(createPropertyDto: CreatePropertyDto): Promise<void> {
    if (
      createPropertyDto.agricultural_area + createPropertyDto.vegetation_area >
      createPropertyDto.total_area
    ) {
      throw new BadRequestException(
        'A soma das áreas agrícola e de vegetação não pode exceder a área total',
      );
    }

    const farmerExists = await this.propertyRepository.findFarmer(
      createPropertyDto.farmer_id,
    );
    if (!farmerExists) {
      throw new BadRequestException('Proprietário não cadastrado');
    }
  }

  async validateUpdate(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<void> {
    const propertyExists = await this.propertyRepository.findProperty(id);
    if (!propertyExists) {
      throw new NotFoundException('Propriedade não encontrada');
    }

    if (
      updatePropertyDto.agricultural_area !== undefined &&
      updatePropertyDto.vegetation_area !== undefined &&
      updatePropertyDto.total_area !== undefined &&
      updatePropertyDto.agricultural_area + updatePropertyDto.vegetation_area >
        updatePropertyDto.total_area
    ) {
      throw new BadRequestException(
        'A soma das áreas agrícola e de vegetação não pode exceder a área total',
      );
    }

    if (updatePropertyDto.farmer_id !== undefined) {
      const existingFarmer = await this.propertyRepository.findFarmer(
        updatePropertyDto.farmer_id,
      );
      if (!existingFarmer) {
        throw new BadRequestException('Proprietário não cadastrado');
      }
    }
  }

  async validateDelete(id: number): Promise<void> {
    const property = await this.propertyRepository.findProperty(id);
    if (!property) {
      throw new NotFoundException('Propriedade não cadastrada');
    }
  }
  async create(createPropertyDto: CreatePropertyDto) {
    if (
      createPropertyDto.agricultural_area + createPropertyDto.vegetation_area >
      createPropertyDto.total_area
    ) {
      throw new BadRequestException(
        'Soma de áreas não representa a área total',
      );
    }

    const farmerExists = await this.propertyRepository.findFarmer(
      createPropertyDto.farmer_id,
    );

    if (!farmerExists) {
      throw new BadRequestException(
        'Esse propietário ainda não foi cadastrado',
      );
    }

    return await this.propertyRepository.create(createPropertyDto);
  }

  async findByState(state: string): Promise<Property[] | null> {
    return await this.propertyRepository.findPropertiesByState(
      state.toUpperCase(),
    );
  }

  async findAll(): Promise<number> {
    const farms = await this.propertyRepository.findAll();
    if (!farms) {
      throw new NotFoundException('Ainda não foram cadastradas propriedades');
    }
    return farms.length;
  }

  async findTotalArea(): Promise<number> {
    const farms = await this.propertyRepository.findAll();
    if (!farms) {
      throw new NotFoundException('Ainda não foram cadastradas propriedades');
    }
    let area = 0;
    farms.forEach((farm) => {
      area += farm.total_area;
    });
    return area;
  }

  async update(
    id: number,
    updateProperty: UpdatePropertyDto,
  ): Promise<Property | null> {
    if (
      updateProperty.agricultural_area + updateProperty.vegetation_area >
      updateProperty.total_area
    ) {
      throw new BadRequestException(
        'Soma de áreas não representa a área total',
      );
    }

    const existingFarmer = await this.propertyRepository.findFarmer(
      updateProperty.farmer_id,
    );

    if (!existingFarmer) {
      throw new BadRequestException({ message: 'Proprietário não cadastrado' });
    }

    const propertyExists = await this.propertyRepository.findProperty(id);

    if (!propertyExists) {
      throw new BadRequestException('Essa propriedade não existe');
    }

    const property = await this.propertyRepository.updateProperty(
      updateProperty,
      id,
    );

    return property;
  }

  async remove(id: number): Promise<Property | null> {
    const property = await this.propertyRepository.findProperty(id);

    if (!property) {
      throw new BadRequestException('Propriedade não cadastrada');
    }
    return this.propertyRepository.deleteProperty(id);
  }
}
