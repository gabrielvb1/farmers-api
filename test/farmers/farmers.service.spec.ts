import { Test, TestingModule } from '@nestjs/testing';
import { FarmersService } from '../../src/farmers/farmers.service';
import { PrismaService } from '../../src/database/prisma.service';
import { FarmerRepository } from '../../src/farmers/repository/farmer.repository';
import { CreateFarmerDto } from '../../src/farmers/dto/create-farmer.dto';
import { Farmer } from '@prisma/client';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateFarmerDto } from 'src/farmers/dto/update-farmer.dto';
import { IFarmerWithRelations } from 'src/database/interfaces/models.interfaces';
describe('FarmersService', () => {
  let farmerService: FarmersService;
  let farmerRepository: FarmerRepository;
  let validationPipe: ValidationPipe;

  const prismaServiceMock = {
    farmer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const farmerRepositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findFarmer: jest.fn(),
    findByCpfCnpj: jest.fn(),
    updateFarmer: jest.fn(),
    deleteFarmer: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        FarmersService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: 'FARMER_REPOSITORY',
          useValue: farmerRepositoryMock, // Mock do FarmerRepository
        },
      ],
    }).compile();

    farmerService = moduleFixture.get<FarmersService>(FarmersService);
    farmerRepository = moduleFixture.get<FarmerRepository>('FARMER_REPOSITORY');
    validationPipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    jest.clearAllMocks();
  });

  it('should validate a farmer with valid CPF and no existing record', async () => {
    const createFarmerDto: CreateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '646.588.700-29',
    };
    jest.spyOn(farmerRepository, 'findByCpfCnpj').mockResolvedValue(null);

    await expect(
      farmerService.validateFarmer(createFarmerDto),
    ).resolves.toBeUndefined();
    expect(farmerRepository.findByCpfCnpj).toHaveBeenCalledWith('64658870029');
  });

  it('should create a farmer with valid cpf_cnpj', async () => {
    const createFarmerDto: CreateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '19958173093',
    };
    const farmer: Farmer = {
      id: 1,
      name: 'John Doe',
      cpf_cnpj: '19958173093',
    };

    jest.spyOn(farmerRepository, 'findByCpfCnpj').mockResolvedValue(null); // Nenhum agricultor existente
    jest.spyOn(farmerRepository, 'create').mockResolvedValue(farmer); // Retorna agricultor criado

    const result = await farmerService.create(createFarmerDto);
    expect(result).toEqual(farmer);
    expect(farmerRepository.findByCpfCnpj).toHaveBeenCalledWith('19958173093');
    expect(farmerRepository.create).toHaveBeenCalledWith(createFarmerDto);
  });

  it('should throw BadRequestException if CPF is invalid', async () => {
    const invalidCpfDto: CreateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '12345678900', // CPF inválido
    };

    await expect(farmerService.validateFarmer(invalidCpfDto)).rejects.toThrow(
      new BadRequestException('CPF ou CNPJ inválidos'),
    );
    expect(farmerRepository.findByCpfCnpj).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if CNPJ is invalid', async () => {
    const invalidCnpjDto: CreateFarmerDto = {
      name: 'Empresa Agricola',
      cpf_cnpj: '00000000000000', // CNPJ inválido
    };

    await expect(farmerService.validateFarmer(invalidCnpjDto)).rejects.toThrow(
      new BadRequestException('CPF ou CNPJ inválidos'),
    );
    expect(farmerRepository.findByCpfCnpj).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if CPF/CNPJ already exists', async () => {
    const createFarmerDto: CreateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '56391307504',
    };
    const existingFarmer: Farmer = {
      id: 1,
      name: 'Existing Farmer',
      cpf_cnpj: '56391307504',
    };

    jest
      .spyOn(farmerRepository, 'findByCpfCnpj')
      .mockResolvedValue(existingFarmer);

    await expect(farmerService.create(createFarmerDto)).rejects.toThrow(
      new BadRequestException('CPF/CNPJ já cadastrado!'),
    );
    expect(farmerRepository.findByCpfCnpj).toHaveBeenCalledWith('56391307504');
    expect(farmerRepository.create).not.toHaveBeenCalled(); // Garante que create não foi chamado
  });

  it('should throw BadRequestException if CPF/CNPJ is not valid', async () => {
    const createFarmerDto: CreateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '12345678900', // CPF inválido (exemplo)
    };

    jest.spyOn(farmerRepository, 'findByCpfCnpj').mockResolvedValue(null);

    await expect(farmerService.create(createFarmerDto)).rejects.toThrow(
      new BadRequestException('CPF ou CNPJ inválidos'),
    );

    expect(farmerRepository.create).not.toHaveBeenCalled(); // Garante que create não foi chamado
  });

  it('should throw BadRequestException if name is empty', async () => {
    const createFarmerDto: CreateFarmerDto = {
      name: '',
      cpf_cnpj: '12345678901', // CPF válido
    };

    await expect(
      validationPipe.transform(createFarmerDto, {
        type: 'body',
        metatype: CreateFarmerDto,
      }),
    ).rejects.toThrowErrorMatchingSnapshot();
    try {
      await validationPipe.transform(createFarmerDto, {
        type: 'body',
        metatype: CreateFarmerDto,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toContain('Envie um nome válido');
    }

    expect(farmerRepository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(farmerRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if name is only whitespace', async () => {
    const createFarmerDto: CreateFarmerDto = {
      name: '   ',
      cpf_cnpj: '12345678901', // CPF válido
    };

    await expect(
      validationPipe.transform(createFarmerDto, {
        type: 'body',
        metatype: CreateFarmerDto,
      }),
    ).rejects.toThrowErrorMatchingSnapshot();

    try {
      await validationPipe.transform(createFarmerDto, {
        type: 'body',
        metatype: CreateFarmerDto,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toContain('Envie um nome válido');
    }

    expect(farmerRepository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(farmerRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if name has special characters', async () => {
    const createFarmerDto: CreateFarmerDto = {
      name: '345834755',
      cpf_cnpj: '12345678901', // CPF válido
    };

    await expect(
      validationPipe.transform(createFarmerDto, {
        type: 'body',
        metatype: CreateFarmerDto,
      }),
    ).rejects.toThrowErrorMatchingSnapshot();

    try {
      await validationPipe.transform(createFarmerDto, {
        type: 'body',
        metatype: CreateFarmerDto,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toContain('Envie um nome válido');
    }

    expect(farmerRepository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(farmerRepository.create).not.toHaveBeenCalled();
  });

  it('should update a farmer with valid cpf_cnpj', async () => {
    const userId = 1;
    const updateFarmerDto: UpdateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '19958173093', // CPF válido
    };
    const existingFarmer: Farmer = {
      id: 1,
      name: 'Old Name',
      cpf_cnpj: '98765432109', // CPF diferente para simular atualização
    };
    const updatedFarmer: Farmer = {
      id: 1,
      name: 'John Doe',
      cpf_cnpj: '19958173093',
    };

    // Mock para verificar se o agricultor existe
    jest
      .spyOn(farmerRepository, 'findFarmer')
      .mockResolvedValue(existingFarmer);

    jest.spyOn(farmerRepository, 'findByCpfCnpj').mockResolvedValue(null);

    jest
      .spyOn(farmerRepository, 'updateFarmer')
      .mockResolvedValue(updatedFarmer);

    const result = await farmerService.update(userId, updateFarmerDto);
    expect(result).toEqual(updatedFarmer);
    expect(farmerRepository.findFarmer).toHaveBeenCalledWith(userId);
    expect(farmerRepository.findByCpfCnpj).toHaveBeenCalledWith('19958173093');
    expect(farmerRepository.updateFarmer).toHaveBeenCalledWith(
      updateFarmerDto,
      userId,
    );
  });

  it('should throw BadRequestException if id does not exist', async () => {
    const id = 100;
    const updateFarmerDto: UpdateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '82974227040',
    };

    jest.spyOn(farmerRepository, 'findFarmer').mockResolvedValue(null);

    await expect(farmerService.update(id, updateFarmerDto)).rejects.toThrow(
      new BadRequestException({ message: 'Proprietário não existe' }),
    );

    expect(farmerRepository.findFarmer).toHaveBeenCalledWith(id);
    expect(farmerRepository.findByCpfCnpj).not.toHaveBeenCalled();
    expect(farmerRepository.updateFarmer).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if CPF/CNPJ is already being used', async () => {
    const id = 1;
    const updateFarmerDto: UpdateFarmerDto = {
      name: 'John Doe',
      cpf_cnpj: '55366212030',
    };

    const existingFarmer = {
      id: 1,
      name: 'Current Farmer',
      cpf_cnpj: '98765432109',
    };

    const farmerWithCpfCnpjAlreadyInUse: Farmer = {
      id: 2,
      name: 'Other Farmer',
      cpf_cnpj: '55366212030',
    };

    jest
      .spyOn(farmerRepository, 'findFarmer')
      .mockResolvedValue(existingFarmer);
    jest
      .spyOn(farmerRepository, 'findByCpfCnpj')
      .mockResolvedValue(farmerWithCpfCnpjAlreadyInUse);

    await expect(farmerService.update(id, updateFarmerDto)).rejects.toThrow(
      new BadRequestException({ message: 'CPF/CNPJ já está cadastrado' }),
    );

    expect(farmerRepository.findFarmer).toHaveBeenCalledWith(id);
    expect(farmerRepository.findByCpfCnpj).toHaveBeenCalledWith('55366212030');
    expect(farmerRepository.updateFarmer).not.toHaveBeenCalled();
  });

  it('should return all farmers with their farms and formatted CPF/CNPJ', async () => {
    const allFarmersFromRepo: IFarmerWithRelations[] = [
      {
        id: 9,
        cpf_cnpj: '08331908066', // Formato limpo (como armazenado no banco)
        name: 'Sao Jao',
        farms: [],
      },
      {
        id: 7,
        cpf_cnpj: '19958173093', // CPF limpo
        name: 'teste editado',
        farms: [
          {
            id: 6,
            farmer_id: 7,
            property_name: 'teste23',
            city: 'teste23',
            uf: 'SP',
            total_area: 200,
            agricultural_area: 100,
            vegetation_area: 50,
            harvests: [
              {
                id: 4,
                property_id: 6,
                year: 2010,
                crops: [],
              },
            ],
          },
          {
            id: 7,
            farmer_id: 7,
            property_name: 'teste23',
            city: 'teste23',
            uf: 'BA',
            total_area: 200,
            agricultural_area: 100,
            vegetation_area: 50,
            harvests: [
              {
                id: 6,
                property_id: 7,
                year: 2025,
                crops: [],
              },
            ],
          },
        ],
      },
      {
        id: 8,
        cpf_cnpj: '96275480000172', // CNPJ limpo
        name: 'Empresa Agricola',
        farms: [],
      },
    ];

    const expectedFarmers: IFarmerWithRelations[] = [
      {
        id: 9,
        cpf_cnpj: '083.319.080-66', // CPF formatado
        name: 'Sao Jao',
        farms: [],
      },
      {
        id: 7,
        cpf_cnpj: '199.581.730-93', // CPF formatado
        name: 'teste editado',
        farms: [
          {
            id: 6,
            farmer_id: 7,
            property_name: 'teste23',
            city: 'teste23',
            uf: 'SP',
            total_area: 200,
            agricultural_area: 100,
            vegetation_area: 50,
            harvests: [
              {
                id: 4,
                property_id: 6,
                year: 2010,
                crops: [],
              },
            ],
          },
          {
            id: 7,
            farmer_id: 7,
            property_name: 'teste23',
            city: 'teste23',
            uf: 'BA',
            total_area: 200,
            agricultural_area: 100,
            vegetation_area: 50,
            harvests: [
              {
                id: 6,
                property_id: 7,
                year: 2025,
                crops: [],
              },
            ],
          },
        ],
      },
      {
        id: 8,
        cpf_cnpj: '96.275.480/0001-72', // CNPJ formatado
        name: 'Empresa Agricola',
        farms: [],
      },
    ];

    jest
      .spyOn(farmerRepository, 'findAll')
      .mockResolvedValue(allFarmersFromRepo);

    const result = await farmerService.findAll();

    expect(result).toEqual(expectedFarmers);
    expect(farmerRepository.findAll).toHaveBeenCalled();
    // Validações específicas para formatação
    expect(result[0].cpf_cnpj).toBe('083.319.080-66'); // CPF formatado
    expect(result[1].cpf_cnpj).toBe('199.581.730-93'); // CPF formatado
    expect(result[2].cpf_cnpj).toBe('96.275.480/0001-72'); // CNPJ formatado
  });

  it('should return a farmer by id with formatted CPF/CNPJ', async () => {
    const id = 1;
    const farmerFromRepo: IFarmerWithRelations = {
      id: 1,
      cpf_cnpj: '77985283005', // CPF limpo
      name: 'John Doe',
      farms: [],
    };
    const expectedFarmer: IFarmerWithRelations = {
      id: 1,
      cpf_cnpj: '779.852.830-05', // CPF formatado
      name: 'John Doe',
      farms: [],
    };

    jest
      .spyOn(farmerRepository, 'findFarmer')
      .mockResolvedValue(farmerFromRepo);

    const result = await farmerService.findOne(id);
    expect(result).toEqual(expectedFarmer);
    expect(farmerRepository.findFarmer).toHaveBeenCalledWith(id);
    expect(result.cpf_cnpj).toBe('779.852.830-05'); // Valida formatação
  });

  it('should throw BadRequestException if farmer id does not exist', async () => {
    const id = 100;

    jest.spyOn(farmerRepository, 'findFarmer').mockResolvedValue(null);

    await expect(farmerService.findOne(id)).rejects.toThrow(
      new BadRequestException('Proprietário não cadastrado'),
    );

    expect(farmerRepository.findFarmer).toHaveBeenCalledWith(id);
  });

  it('should delete a farmer successfully', async () => {
    const id = 1;
    const deletedFarmer: IFarmerWithRelations = {
      id: 1,
      name: 'John Doe',
      cpf_cnpj: '123.456.789-09',
      farms: [],
    };

    jest.spyOn(farmerRepository, 'findFarmer').mockResolvedValue(deletedFarmer);
    jest
      .spyOn(farmerRepository, 'deleteFarmer')
      .mockResolvedValue(deletedFarmer);

    const result = await farmerService.remove(id);

    expect(result).toEqual(deletedFarmer);
    expect(farmerRepository.findFarmer).toHaveBeenCalledWith(id);
    expect(farmerRepository.deleteFarmer).toHaveBeenCalledWith(id);
  });

  it('should throw BadRequestException if farmer id does not exist', async () => {
    const id = 100;

    jest.spyOn(farmerRepository, 'findFarmer').mockResolvedValue(null);

    await expect(farmerService.remove(id)).rejects.toThrow(
      new BadRequestException({ message: 'Proprietário não cadastrado' }),
    );

    expect(farmerRepository.findFarmer).toHaveBeenCalledWith(id);
    expect(farmerRepository.deleteFarmer).not.toHaveBeenCalled();
  });
});
