import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from '../../src/properties/properties.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from '../../src/properties/dto/create-property.dto';
import { UpdatePropertyDto } from '../../src/properties/dto/update-property.dto';
import { IProperty } from 'src/database/interfaces/models.interfaces';
describe('PropertiesService', () => {
  let propertiesService: PropertiesService;
  let propertyRepository: any;

  const propertyRepositoryMock = {
    create: jest.fn(),
    findFarmer: jest.fn(),
    findPropertiesByState: jest.fn(),
    findAll: jest.fn(),
    findProperty: jest.fn(),
    updateProperty: jest.fn(),
    deleteProperty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
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

    propertiesService = module.get<PropertiesService>(PropertiesService);
    propertyRepository = module.get('PROPERTY_REPOSITORY');
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPropertyDto: CreatePropertyDto = {
      farmer_id: 1,
      property_name: 'Fazenda Teste',
      city: 'Teste City',
      uf: 'SP',
      total_area: 200,
      agricultural_area: 100,
      vegetation_area: 50,
    };

    it('should create a property successfully', async () => {
      const property: IProperty = {
        id: 1,
        ...createPropertyDto,
        harvests: [],
      };

      jest.spyOn(propertyRepository, 'findFarmer').mockResolvedValue({
        id: 1,
        name: 'John Doe',
        cpf_cnpj: '123.456.789-09',
      });
      jest.spyOn(propertyRepository, 'create').mockResolvedValue(property);

      const result = await propertiesService.create(createPropertyDto);

      expect(result).toEqual(property);
      expect(propertyRepository.findFarmer).toHaveBeenCalledWith(
        createPropertyDto.farmer_id,
      );
      expect(propertyRepository.create).toHaveBeenCalledWith(createPropertyDto);
    });

    it('should throw BadRequestException if agricultural_area + vegetation_area > total_area', async () => {
      const invalidPropertyDto: CreatePropertyDto = {
        ...createPropertyDto,
        agricultural_area: 150,
        vegetation_area: 100,
        total_area: 200,
      };

      await expect(
        propertiesService.create(invalidPropertyDto),
      ).rejects.toThrow(
        new BadRequestException('Soma de áreas não representa a área total'),
      );

      expect(propertyRepository.findFarmer).not.toHaveBeenCalled();
      expect(propertyRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if farmer does not exist', async () => {
      jest.spyOn(propertyRepository, 'findFarmer').mockResolvedValue(null);

      await expect(propertiesService.create(createPropertyDto)).rejects.toThrow(
        new BadRequestException('Esse propietário ainda não foi cadastrado'),
      );

      expect(propertyRepository.findFarmer).toHaveBeenCalledWith(
        createPropertyDto.farmer_id,
      );
      expect(propertyRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findByState', () => {
    it('should return properties by state', async () => {
      const state = 'SP';
      const properties: IProperty[] = [
        {
          id: 1,
          farmer_id: 1,
          property_name: 'Fazenda Teste',
          city: 'Teste City',
          uf: 'SP',
          total_area: 200,
          agricultural_area: 100,
          vegetation_area: 50,
          harvests: [],
        },
      ];

      jest
        .spyOn(propertyRepository, 'findPropertiesByState')
        .mockResolvedValue(properties);

      const result = await propertiesService.findByState(state);

      expect(result).toEqual(properties);
      expect(propertyRepository.findPropertiesByState).toHaveBeenCalledWith(
        'SP',
      );
    });

    it('should return null if no properties are found for the state', async () => {
      const state = 'RJ';

      jest
        .spyOn(propertyRepository, 'findPropertiesByState')
        .mockResolvedValue(null);

      const result = await propertiesService.findByState(state);

      expect(result).toBeNull();
      expect(propertyRepository.findPropertiesByState).toHaveBeenCalledWith(
        'RJ',
      );
    });
  });

  describe('findAll', () => {
    it('should return the total number of properties', async () => {
      const properties: IProperty[] = [
        {
          id: 1,
          farmer_id: 1,
          property_name: 'Fazenda Teste',
          city: 'Teste City',
          uf: 'SP',
          total_area: 200,
          agricultural_area: 100,
          vegetation_area: 50,
          harvests: [],
        },
        {
          id: 2,
          farmer_id: 2,
          property_name: 'Fazenda Teste 2',
          city: 'Teste City 2',
          uf: 'BA',
          total_area: 300,
          agricultural_area: 150,
          vegetation_area: 100,
          harvests: [],
        },
      ];

      jest.spyOn(propertyRepository, 'findAll').mockResolvedValue(properties);

      const result = await propertiesService.findAll();

      expect(result).toBe(2);
      expect(propertyRepository.findAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no properties are found', async () => {
      jest.spyOn(propertyRepository, 'findAll').mockResolvedValue(null);

      await expect(propertiesService.findAll()).rejects.toThrow(
        new NotFoundException('Ainda não foram cadastradas propriedades'),
      );

      expect(propertyRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findTotalArea', () => {
    it('should return the sum of total_area of all properties', async () => {
      const properties: IProperty[] = [
        {
          id: 1,
          farmer_id: 1,
          property_name: 'Fazenda Teste',
          city: 'Teste City',
          uf: 'SP',
          total_area: 200,
          agricultural_area: 100,
          vegetation_area: 50,
          harvests: [],
        },
        {
          id: 2,
          farmer_id: 2,
          property_name: 'Fazenda Teste 2',
          city: 'Teste City 2',
          uf: 'BA',
          total_area: 300,
          agricultural_area: 150,
          vegetation_area: 100,
          harvests: [],
        },
      ];

      jest.spyOn(propertyRepository, 'findAll').mockResolvedValue(properties); // isso é como se a funcao findAll do propertyRepository fosse chamada e devolvesse o valor que mockamos em const properties. Na linha abaixo o propertiesService recebe esse valor, por isso funciona sem o prisma ser chamado

      const result = await propertiesService.findTotalArea();

      expect(result).toBe(500);
      expect(propertyRepository.findAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no properties are found', async () => {
      jest.spyOn(propertyRepository, 'findAll').mockResolvedValue(null);

      await expect(propertiesService.findTotalArea()).rejects.toThrow(
        new NotFoundException('Ainda não foram cadastradas propriedades'),
      );

      expect(propertyRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updatePropertyDto: UpdatePropertyDto = {
      farmer_id: 1,
      property_name: 'Fazenda Atualizada',
      city: 'Cidade Atualizada',
      uf: 'SP',
      total_area: 250,
      agricultural_area: 120,
      vegetation_area: 80,
    };

    it('should update a property successfully', async () => {
      const id = 1;
      const existingProperty: IProperty = {
        id: 1,
        farmer_id: 1,
        property_name: 'Fazenda Teste',
        city: 'Teste City',
        uf: 'SP',
        total_area: 200,
        agricultural_area: 100,
        vegetation_area: 50,
        harvests: [],
      };
      const updatedProperty: IProperty = {
        id: 1,
        farmer_id: updatePropertyDto.farmer_id!,
        property_name: updatePropertyDto.property_name,
        city: updatePropertyDto.city,
        uf: updatePropertyDto.uf,
        total_area: updatePropertyDto.total_area,
        agricultural_area: updatePropertyDto.agricultural_area,
        vegetation_area: updatePropertyDto.vegetation_area,
        harvests: [],
      };

      jest.spyOn(propertyRepository, 'findFarmer').mockResolvedValue({
        id: 1,
        name: 'John Doe',
        cpf_cnpj: '123.456.789-09',
      });
      jest
        .spyOn(propertyRepository, 'findProperty')
        .mockResolvedValue(existingProperty);
      jest
        .spyOn(propertyRepository, 'updateProperty')
        .mockResolvedValue(updatedProperty);

      const result = await propertiesService.update(id, updatePropertyDto);

      expect(result).toEqual(updatedProperty);
      expect(propertyRepository.findFarmer).toHaveBeenCalledWith(
        updatePropertyDto.farmer_id,
      );
      expect(propertyRepository.findProperty).toHaveBeenCalledWith(id);
      expect(propertyRepository.updateProperty).toHaveBeenCalledWith(
        updatePropertyDto,
        id,
      );
    });

    it('should throw BadRequestException if agricultural_area + vegetation_area > total_area', async () => {
      const id = 1;
      const invalidPropertyDto: UpdatePropertyDto = {
        ...updatePropertyDto,
        agricultural_area: 200,
        vegetation_area: 100,
        total_area: 250,
      };

      await expect(
        propertiesService.update(id, invalidPropertyDto),
      ).rejects.toThrow(
        new BadRequestException('Soma de áreas não representa a área total'),
      );

      expect(propertyRepository.findFarmer).not.toHaveBeenCalled();
      expect(propertyRepository.findProperty).not.toHaveBeenCalled();
      expect(propertyRepository.updateProperty).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if farmer does not exist', async () => {
      const id = 1;

      jest.spyOn(propertyRepository, 'findFarmer').mockResolvedValue(null);

      await expect(
        propertiesService.update(id, updatePropertyDto),
      ).rejects.toThrow(
        new BadRequestException({ message: 'Proprietário não cadastrado' }),
      );

      expect(propertyRepository.findFarmer).toHaveBeenCalledWith(
        updatePropertyDto.farmer_id,
      );
      expect(propertyRepository.findProperty).not.toHaveBeenCalled();
      expect(propertyRepository.updateProperty).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if property does not exist', async () => {
      const id = 1;

      jest.spyOn(propertyRepository, 'findFarmer').mockResolvedValue({
        id: 1,
        name: 'John Doe',
        cpf_cnpj: '123.456.789-09',
      });
      jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue(null);

      await expect(
        propertiesService.update(id, updatePropertyDto),
      ).rejects.toThrow(new BadRequestException('Essa propriedade não existe'));

      expect(propertyRepository.findFarmer).toHaveBeenCalledWith(
        updatePropertyDto.farmer_id,
      );
      expect(propertyRepository.findProperty).toHaveBeenCalledWith(id);
      expect(propertyRepository.updateProperty).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a property successfully', async () => {
      const id = 1;
      const property: IProperty = {
        id: 1,
        farmer_id: 1,
        property_name: 'Fazenda Teste',
        city: 'Teste City',
        uf: 'SP',
        total_area: 200,
        agricultural_area: 100,
        vegetation_area: 50,
        harvests: [],
      };

      jest
        .spyOn(propertyRepository, 'findProperty')
        .mockResolvedValue(property);
      jest
        .spyOn(propertyRepository, 'deleteProperty')
        .mockResolvedValue(property);

      const result = await propertiesService.remove(id);

      expect(result).toEqual(property);
      expect(propertyRepository.findProperty).toHaveBeenCalledWith(id);
      expect(propertyRepository.deleteProperty).toHaveBeenCalledWith(id);
    });

    it('should throw BadRequestException if property does not exist', async () => {
      const id = 1;

      jest.spyOn(propertyRepository, 'findProperty').mockResolvedValue(null);

      await expect(propertiesService.remove(id)).rejects.toThrow(
        new BadRequestException('Propriedade não cadastrada'),
      );

      expect(propertyRepository.findProperty).toHaveBeenCalledWith(id);
      expect(propertyRepository.deleteProperty).not.toHaveBeenCalled();
    });
  });
});
