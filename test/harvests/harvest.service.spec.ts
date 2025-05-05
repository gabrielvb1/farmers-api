import { Test, TestingModule } from '@nestjs/testing';
import { HarvestsService } from '../../src/harvests/harvests.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateHarvestDto } from '../../src/harvests/dto/create-harvest.dto';
import { UpdateHarvestDto } from '../../src/harvests/dto/update-harvest.dto';
import { IHarvest } from 'src/database/interfaces/models.interfaces';
import { IHarvestRepository } from 'src/harvests/interfaces/harvest-repository.interface';
import { IPropertyRepository } from 'src/properties/interfaces/property-repository.interface';
import { Harvest } from '@prisma/client';

describe('HarvestsService', () => {
  let harvestsService: HarvestsService;
  let harvestRepository: IHarvestRepository;
  let propertyRepository: IPropertyRepository;

  const harvestRepositoryMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const propertyRepositoryMock = {
    findProperty: jest.fn(),
  };

  const mockCurrentYear = 2025;
  jest.spyOn(global, 'Date').mockImplementation(
    () =>
      ({
        getUTCFullYear: () => mockCurrentYear,
      }) as any,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HarvestsService,
        {
          provide: 'HARVEST_REPOSITORY',
          useValue: harvestRepositoryMock,
        },
        {
          provide: 'PROPERTY_REPOSITORY',
          useValue: propertyRepositoryMock,
        },
        {
          provide: 'PrismaService',
          useValue: {},
        },
      ],
    }).compile();

    harvestsService = module.get<HarvestsService>(HarvestsService);
    harvestRepository = module.get('HARVEST_REPOSITORY');
    propertyRepository = module.get('PROPERTY_REPOSITORY');
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should validate create successfully', async () => {
    const createHarvestDto: CreateHarvestDto = {
      property_id: 1,
      year: 2024,
    };
    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue({
      id: 1,
      farmer_id: 7,
      property_name: 'teste23',
      city: 'teste23',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    });
    jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(null);

    await expect(
      harvestsService.validateCreate(createHarvestDto),
    ).resolves.toBeUndefined();
    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      createHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).toHaveBeenCalledWith(createHarvestDto);
  });

  it('should validate update successfully with property_id and year', async () => {
    const updateHarvestDto: UpdateHarvestDto = {
      property_id: 2,
      year: 2023,
    };
    const id = 1;
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };

    jest
      .spyOn(harvestRepository, 'findById')
      .mockResolvedValue(existingHarvest);
    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue({
      id: 2,
      farmer_id: 7,
      property_name: 'teste23',
      city: 'teste23',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    });
    jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(null);

    await expect(
      harvestsService.validateUpdate(id, updateHarvestDto),
    ).resolves.toBeUndefined();
    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      updateHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).toHaveBeenCalledWith({
      property_id: updateHarvestDto.property_id,
      year: updateHarvestDto.year,
    });
  });

  it('should validate update successfully with only year', async () => {
    const id = 1;
    const partialUpdateDto: UpdateHarvestDto = {
      year: 2023,
    };
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };

    jest
      .spyOn(harvestRepository, 'findById')
      .mockResolvedValue(existingHarvest);

    await expect(
      harvestsService.validateUpdate(id, partialUpdateDto),
    ).resolves.toBeUndefined();
    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).not.toHaveBeenCalled();
    expect(harvestRepository.findOne).not.toHaveBeenCalled();
  });

  it('should validate update successfully with only property_id', async () => {
    const id = 1;
    const partialUpdateDto: UpdateHarvestDto = {
      property_id: 2,
    };
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };

    jest
      .spyOn(harvestRepository, 'findById')
      .mockResolvedValue(existingHarvest);
    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue({
      id: 2,
      farmer_id: 7,
      property_name: 'teste23',
      city: 'teste23',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    });

    await expect(
      harvestsService.validateUpdate(id, partialUpdateDto),
    ).resolves.toBeUndefined();
    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      partialUpdateDto.property_id,
    );
    expect(harvestRepository.findOne).not.toHaveBeenCalled();
  });

  it('should create a harvest successfully', async () => {
    const createHarvestDto: CreateHarvestDto = {
      property_id: 1,
      year: 2024,
    };
    const harvest: Harvest = {
      id: 1,
      property_id: 1,
      year: 2024,
    };

    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue({
      id: 1,
      farmer_id: 7,
      property_name: 'teste23',
      city: 'teste23',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    });
    jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(harvestRepository, 'create').mockResolvedValue(harvest);

    const result = await harvestsService.create(createHarvestDto);

    expect(result).toEqual(harvest);
    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      createHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).toHaveBeenCalledWith(createHarvestDto);
    expect(harvestRepository.create).toHaveBeenCalledWith(createHarvestDto);
  });

  it('should throw BadRequestException if year is greater than current year', async () => {
    const createHarvestDto: CreateHarvestDto = {
      property_id: 1,
      year: 2024,
    };
    const invalidHarvestDto: CreateHarvestDto = {
      ...createHarvestDto,
      year: mockCurrentYear + 1,
    };

    await expect(harvestsService.create(invalidHarvestDto)).rejects.toThrow(
      new BadRequestException({ message: 'Insira um ano menor que o atual' }),
    );

    expect(propertyRepository.findProperty).not.toHaveBeenCalled();
    expect(harvestRepository.findOne).not.toHaveBeenCalled();
    expect(harvestRepository.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if property does not exist', async () => {
    const createHarvestDto: CreateHarvestDto = {
      property_id: 1,
      year: 2024,
    };
    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue(null);

    await expect(harvestsService.create(createHarvestDto)).rejects.toThrow(
      new NotFoundException('Propriedade não encontrada'),
    );

    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      createHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).not.toHaveBeenCalled();
    expect(harvestRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if harvest year already exists for the property', async () => {
    const createHarvestDto: CreateHarvestDto = {
      property_id: 1,
      year: 2024,
    };
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };

    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue({
      id: 1,
      farmer_id: 7,
      property_name: 'teste23',
      city: 'teste23',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    });
    jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(existingHarvest);

    await expect(harvestsService.create(createHarvestDto)).rejects.toThrow(
      new BadRequestException(
        'Ano da colheita já cadastrado para essa propriedade',
      ),
    );

    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      createHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).toHaveBeenCalledWith(createHarvestDto);
    expect(harvestRepository.create).not.toHaveBeenCalled();
  });

  it('should update a harvest successfully', async () => {
    const updateHarvestDto: UpdateHarvestDto = {
      property_id: 2,
      year: 2023,
    };

    const id = 1;
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };
    const updatedHarvest: IHarvest = {
      id: 1,
      property_id: 2,
      year: 2023,
      crops: [],
    };

    jest
      .spyOn(harvestRepository, 'findById')
      .mockResolvedValue(existingHarvest);
    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue({
      id: 2,
      farmer_id: 7,
      property_name: 'teste23',
      city: 'teste23',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    });
    jest.spyOn(harvestRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(harvestRepository, 'update').mockResolvedValue(updatedHarvest);

    const result = await harvestsService.update(id, updateHarvestDto);

    expect(result).toEqual(updatedHarvest);
    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      updateHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).toHaveBeenCalledWith({
      property_id: updateHarvestDto.property_id,
      year: updateHarvestDto.year,
    });
    expect(harvestRepository.update).toHaveBeenCalledWith(id, updateHarvestDto);
  });

  it('should update a harvest successfully with only year provided', async () => {
    const id = 1;
    const partialUpdateDto: UpdateHarvestDto = {
      year: 2023,
    };
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };
    const updatedHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2023,
      crops: [],
    };

    jest
      .spyOn(harvestRepository, 'findById')
      .mockResolvedValue(existingHarvest);
    jest.spyOn(harvestRepository, 'update').mockResolvedValue(updatedHarvest);

    const result = await harvestsService.update(id, partialUpdateDto);

    expect(result).toEqual(updatedHarvest);
    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).not.toHaveBeenCalled();
    expect(harvestRepository.findOne).not.toHaveBeenCalled();
    expect(harvestRepository.update).toHaveBeenCalledWith(id, partialUpdateDto);
  });

  it('should throw NotFoundException if harvest does not exist', async () => {
    const updateHarvestDto: UpdateHarvestDto = {
      property_id: 2,
      year: 2023,
    };

    const id = 1;

    jest.spyOn(harvestRepository, 'findById').mockResolvedValue(null);

    await expect(harvestsService.update(id, updateHarvestDto)).rejects.toThrow(
      new NotFoundException('Colheita não encontrada'),
    );

    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).not.toHaveBeenCalled();
    expect(harvestRepository.findOne).not.toHaveBeenCalled();
    expect(harvestRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if property does not exist', async () => {
    const updateHarvestDto: UpdateHarvestDto = {
      property_id: 2,
      year: 2023,
    };

    const id = 1;
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };

    jest
      .spyOn(harvestRepository, 'findById')
      .mockResolvedValue(existingHarvest);
    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue(null);

    await expect(harvestsService.update(id, updateHarvestDto)).rejects.toThrow(
      new NotFoundException('Propriedade não encontrada'),
    );

    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      updateHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).not.toHaveBeenCalled();
    expect(harvestRepository.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if harvest year already exists for the property', async () => {
    const updateHarvestDto: UpdateHarvestDto = {
      property_id: 2,
      year: 2023,
    };

    const id = 1;
    const existingHarvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };
    const conflictingHarvest: IHarvest = {
      id: 2,
      property_id: 2,
      year: 2023,
      crops: [],
    };

    jest
      .spyOn(harvestRepository, 'findById')
      .mockResolvedValue(existingHarvest);
    jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue({
      id: 2,
      farmer_id: 7,
      property_name: 'teste23',
      city: 'teste23',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    });
    jest
      .spyOn(harvestRepository, 'findOne')
      .mockResolvedValue(conflictingHarvest);

    await expect(harvestsService.update(id, updateHarvestDto)).rejects.toThrow(
      new BadRequestException(
        'Ano da colheita já cadastrado para essa propriedade',
      ),
    );

    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(propertyRepository.findProperty).toHaveBeenCalledWith(
      updateHarvestDto.property_id,
    );
    expect(harvestRepository.findOne).toHaveBeenCalledWith({
      property_id: updateHarvestDto.property_id,
      year: updateHarvestDto.year,
    });
    expect(harvestRepository.update).not.toHaveBeenCalled();
  });

  it('should remove a harvest successfully', async () => {
    const id = 1;
    const harvest: IHarvest = {
      id: 1,
      property_id: 1,
      year: 2024,
      crops: [],
    };

    jest.spyOn(harvestRepository, 'findById').mockResolvedValue(harvest);
    jest.spyOn(harvestRepository, 'remove').mockResolvedValue(harvest);

    const result = await harvestsService.remove(id);

    expect(result).toEqual(harvest);
    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(harvestRepository.remove).toHaveBeenCalledWith(id);
  });

  it('should throw NotFoundException if harvest does not exist', async () => {
    const id = 1;

    jest.spyOn(harvestRepository, 'findById').mockResolvedValue(null);

    await expect(harvestsService.remove(id)).rejects.toThrow(
      new NotFoundException('Colheita não encontrada'),
    );

    expect(harvestRepository.findById).toHaveBeenCalledWith(id);
    expect(harvestRepository.remove).not.toHaveBeenCalled();
  });
});
