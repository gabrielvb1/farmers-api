import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { Farmer } from '@prisma/client';
import { IFarmerService } from './interfaces/farmer-service.interface';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { IFarmerRepository } from './interfaces/farmer-repository.interface';
import { cleanCpfCnpj, validateCpfCnpj } from 'src/utils/utils';
@Injectable()
export class FarmersService implements IFarmerService {
  constructor(
    @Inject('FARMER_REPOSITORY') private farmerRepository: IFarmerRepository,
  ) {}

  async validateFarmer(createFarmerDto: CreateFarmerDto): Promise<void> {
    const cleanedCpfCnpj = cleanCpfCnpj(createFarmerDto.cpf_cnpj);
    if (!cleanedCpfCnpj || !validateCpfCnpj(cleanedCpfCnpj)) {
      throw new BadRequestException('CPF ou CNPJ inválidos');
    }
    const existingFarmer =
      await this.farmerRepository.findByCpfCnpj(cleanedCpfCnpj);

    if (existingFarmer) {
      throw new BadRequestException('CPF/CNPJ já cadastrado!');
    }
  }

  async validateUpdate(
    id: number,
    updateFarmerDto: UpdateFarmerDto,
  ): Promise<void> {
    const farmer = await this.farmerRepository.findFarmer(id);
    if (!farmer) {
      throw new NotFoundException('Farmer não encontrado');
    }
    if (updateFarmerDto.cpf_cnpj) {
      const cleanedCpfCnpj = cleanCpfCnpj(updateFarmerDto.cpf_cnpj);
      if (!cleanedCpfCnpj || !validateCpfCnpj(cleanedCpfCnpj)) {
        throw new BadRequestException('CPF ou CNPJ inválidos');
      }

      const existingFarmer =
        await this.farmerRepository.findByCpfCnpj(cleanedCpfCnpj);
      if (existingFarmer && existingFarmer.id !== id) {
        throw new BadRequestException('CPF/CNPJ já cadastrado!');
      }
    }
  }

  async create(createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    const isValidCpfCnpg = validateCpfCnpj(createFarmerDto.cpf_cnpj);

    if (!isValidCpfCnpg) {
      throw new BadRequestException('CPF ou CNPJ inválidos');
    }

    const existingFarmer = await this.farmerRepository.findByCpfCnpj(
      createFarmerDto.cpf_cnpj,
    );
    if (existingFarmer) {
      throw new BadRequestException('CPF/CNPJ já cadastrado!');
    }

    return this.farmerRepository.create(createFarmerDto);
  }

  async findAll(): Promise<Farmer[]> {
    const farmers = await this.farmerRepository.findAll();
    return farmers.map((farmer) => {
      const cleaned = farmer.cpf_cnpj.replace(/\D/g, '');
      let dataFormated = '';

      if (cleaned.length === 11 && cpf.isValid(cleaned)) {
        dataFormated = cpf.format(cleaned);
      } else if (cleaned.length === 14 && cnpj.isValid(cleaned)) {
        dataFormated = cnpj.format(cleaned);
      }

      return { ...farmer, cpf_cnpj: dataFormated };
    });
  }

  async findOne(id: number): Promise<Farmer | null> {
    const farmer = await this.farmerRepository.findFarmer(id);

    if (!farmer) {
      throw new BadRequestException('Proprietário não cadastrado');
    }
    const cleaned = farmer.cpf_cnpj.replace(/\D/g, '');
    let dataFormated = '';
    if (cleaned.length === 11 && cpf.isValid(cleaned)) {
      dataFormated = cpf.format(cleaned);
    } else if (cleaned.length === 14 && cnpj.isValid(cleaned)) {
      dataFormated = cnpj.format(cleaned);
    }
    return { ...farmer, cpf_cnpj: dataFormated };
  }

  async update(
    id: number,
    updateFarmerDto: UpdateFarmerDto,
  ): Promise<Farmer | null> {
    const isValidCpfCnpj = validateCpfCnpj(updateFarmerDto.cpf_cnpj);
    const cleanedCpfCnpj = updateFarmerDto.cpf_cnpj.replace(/\D/g, '');

    if (!isValidCpfCnpj) {
      throw new BadRequestException('CPF ou CNPJ inválidos');
    }

    const existingFarmer = await this.farmerRepository.findFarmer(id);

    if (!existingFarmer) {
      throw new BadRequestException({ message: 'Proprietário não existe' });
    }

    const existingCpfCnpj =
      await this.farmerRepository.findByCpfCnpj(cleanedCpfCnpj);

    if (existingCpfCnpj && existingCpfCnpj.id !== id) {
      throw new BadRequestException({ message: 'CPF/CNPJ já está cadastrado' });
    }
    const farmer = await this.farmerRepository.updateFarmer(
      updateFarmerDto,
      id,
    );

    return farmer;
  }

  async remove(id: number): Promise<Farmer | null> {
    const farmer = await this.farmerRepository.findFarmer(id);

    if (!farmer) {
      throw new BadRequestException('Proprietário não cadastrado');
    }
    return this.farmerRepository.deleteFarmer(id);
  }

  async processFarmerCreation(createFarmerDto: CreateFarmerDto): Promise<void> {
    const cleanedCpfCnpj = createFarmerDto.cpf_cnpj.replace(/\D/g, '');

    await this.farmerRepository.create({
      ...createFarmerDto,
      cpf_cnpj: cleanedCpfCnpj,
    });
  }
}
