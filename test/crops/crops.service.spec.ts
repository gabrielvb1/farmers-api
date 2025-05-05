import { Test, TestingModule } from '@nestjs/testing';
import { CropsService } from '../../src/crops/crops.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCropDto } from '../../src/crops/dto/create-crop.dto';
import { UpdateCropDto } from '../../src/crops/dto/update-crop.dto';
import { ICrop } from 'src/database/interfaces/models.interfaces';

describe('CropsService', () => {
  let cropsService: CropsService;
  let cropRepository: any;
  let harvestRepository: any;

  const cropRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const harvestRepositoryMock = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CropsService,
        {
          provide: 'CROP_REPOSITORY',
          useValue: cropRepositoryMock,
        },
        {
          provide: 'HARVEST_REPOSITORY',
          useValue: harvestRepositoryMock,
        },
        {
          provide: 'PrismaService',
          useValue: {},
        },
      ],
    }).compile();

    cropsService = module.get<CropsService>(CropsService);
    cropRepository = module.get('CROP_REPOSITORY');
    harvestRepository = module.get('HARVEST_REPOSITORY');
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCropDto: CreateCropDto = {
      harvest_id: 1,
      name: 'Milho',
    };

    it('should create a crop successfully', async () => {
      const crop: ICrop = {
        id: 1,
        harvest_id: 1,
        name: 'Milho',
      };

      jest
        .spyOn(harvestRepository, 'findById')
        .mockResolvedValue({ id: 1, property_id: 1, year: 2024 });
      jest.spyOn(cropRepository, 'create').mockResolvedValue(crop);

      const result = await cropsService.create(createCropDto);

      expect(result).toEqual(crop);
      expect(harvestRepository.findById).toHaveBeenCalledWith(
        createCropDto.harvest_id,
      );
      expect(cropRepository.create).toHaveBeenCalledWith(createCropDto);
    });

    it('should throw BadRequestException if harvest does not exist', async () => {
      jest.spyOn(harvestRepository, 'findById').mockResolvedValue(null);

      await expect(cropsService.create(createCropDto)).rejects.toThrow(
        new BadRequestException('Safra não encontrada'),
      );

      expect(harvestRepository.findById).toHaveBeenCalledWith(
        createCropDto.harvest_id,
      );
      expect(cropRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateCropDto: UpdateCropDto = {
      harvest_id: 2,
      name: 'Soja',
    };

    it('should update a crop successfully', async () => {
      const id = 1;
      const existingCrop: ICrop = {
        id: 1,
        harvest_id: 1,
        name: 'Milho',
      };
      const updatedCrop: ICrop = {
        id: 1,
        harvest_id: 2,
        name: 'Soja',
      };

      jest.spyOn(cropRepository, 'findById').mockResolvedValue(existingCrop);
      jest
        .spyOn(harvestRepository, 'findById')
        .mockResolvedValue({ id: 2, property_id: 1, year: 2024 });
      jest.spyOn(cropRepository, 'update').mockResolvedValue(updatedCrop);

      const result = await cropsService.update(id, updateCropDto);

      expect(result).toEqual(updatedCrop);
      expect(cropRepository.findById).toHaveBeenCalledWith(id);
      expect(harvestRepository.findById).toHaveBeenCalledWith(
        updateCropDto.harvest_id,
      );
      expect(cropRepository.update).toHaveBeenCalledWith(id, updateCropDto);
    });

    it('should update a crop successfully with only name provided', async () => {
      const id = 1;
      const partialUpdateDto: UpdateCropDto = {
        name: 'Soja',
      };
      const existingCrop: ICrop = {
        id: 1,
        harvest_id: 1,
        name: 'Milho',
      };
      const updatedCrop: ICrop = {
        id: 1,
        harvest_id: 1,
        name: 'Soja',
      };

      jest.spyOn(cropRepository, 'findById').mockResolvedValue(existingCrop);
      jest.spyOn(cropRepository, 'update').mockResolvedValue(updatedCrop);

      const result = await cropsService.update(id, partialUpdateDto);

      expect(result).toEqual(updatedCrop);
      expect(cropRepository.findById).toHaveBeenCalledWith(id);
      expect(harvestRepository.findById).not.toHaveBeenCalled();
      expect(cropRepository.update).toHaveBeenCalledWith(id, partialUpdateDto);
    });

    it('should throw NotFoundException if crop does not exist', async () => {
      const id = 1;

      jest.spyOn(cropRepository, 'findById').mockResolvedValue(null);

      await expect(cropsService.update(id, updateCropDto)).rejects.toThrow(
        new NotFoundException('Cultura não encontrada'),
      );

      expect(cropRepository.findById).toHaveBeenCalledWith(id);
      expect(harvestRepository.findById).not.toHaveBeenCalled();
      expect(cropRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if harvest does not exist', async () => {
      const id = 1;
      const existingCrop: ICrop = {
        id: 1,
        harvest_id: 1,
        name: 'Milho',
      };

      jest.spyOn(cropRepository, 'findById').mockResolvedValue(existingCrop);
      jest.spyOn(harvestRepository, 'findById').mockResolvedValue(null);

      await expect(cropsService.update(id, updateCropDto)).rejects.toThrow(
        new BadRequestException('Safra não encontrada'),
      );

      expect(cropRepository.findById).toHaveBeenCalledWith(id);
      expect(harvestRepository.findById).toHaveBeenCalledWith(
        updateCropDto.harvest_id,
      );
      expect(cropRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a crop successfully', async () => {
      const id = 1;
      const crop: ICrop = {
        id: 1,
        harvest_id: 1,
        name: 'Milho',
      };

      jest.spyOn(cropRepository, 'findById').mockResolvedValue(crop);
      jest.spyOn(cropRepository, 'remove').mockResolvedValue(crop);

      const result = await cropsService.remove(id);

      expect(result).toEqual(crop);
      expect(cropRepository.findById).toHaveBeenCalledWith(id);
      expect(cropRepository.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if crop does not exist', async () => {
      const id = 1;

      jest.spyOn(cropRepository, 'findById').mockResolvedValue(null);

      await expect(cropsService.remove(id)).rejects.toThrow(
        new NotFoundException('Cultura não encontrada'),
      );

      expect(cropRepository.findById).toHaveBeenCalledWith(id);
      expect(cropRepository.remove).not.toHaveBeenCalled();
    });
  });
});
