import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { IPropertyService } from './interfaces/property-service.interface';
import { SqsService } from '../sqs/sqs.service';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  private readonly logger = new Logger(PropertiesController.name);

  constructor(
    @Inject('PROPERTY_SERVICE')
    private readonly propertiesService: IPropertyService,
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento para a criação de uma propriedade' })
  @ApiBody({
    type: CreatePropertyDto,
    description: 'Objeto para criação de uma nova propriedade',
  })
  @ApiResponse({
    status: 202,
    description: 'Property creation queued successfully',
    schema: {
      example: {
        message: 'Property creation queued successfully',
        data: {
          property_name: 'Teste Fazenda',
          city: 'Salvador',
          uf: 'BA',
          total_area: 200,
          agricultural_area: 100,
          vegetation_area: 50,
          farmer_id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or farmer not found',
  })
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    this.logger.log(
      `Received request to create property: ${JSON.stringify(createPropertyDto)}`,
    );

    await this.propertiesService.validateCreate(createPropertyDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'CREATE_PROPERTY',
        data: createPropertyDto,
      });
      this.logger.log(`Property creation queued`);

      return {
        message: 'Property creation queued successfully',
        data: createPropertyDto,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue property creation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retorna o numero total de propriedades' })
  @ApiResponse({
    status: 200,
    description: 'Numero total de propriedades',
    schema: {
      example: { total: 42 },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Não há propriedades cadastradas',
  })
  async findAll() {
    const total = await this.propertiesService.findAll();
    return { total };
  }

  @Get('/area')
  @ApiOperation({
    summary: 'Retorna a soma total das areas das propriedades cadastradas',
  })
  @ApiResponse({
    status: 200,
    description: 'Area total em hectares',
    schema: {
      example: { totalArea: 1000 },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Não há prorpiedades cadastradas',
  })
  async findTotalArea() {
    const totalArea = await this.propertiesService.findTotalArea();
    return { totalArea };
  }

  @Get(':state')
  @ApiOperation({ summary: 'Retorna as propriedades por estado' })
  @ApiParam({
    name: 'state',
    description: 'Abreviação do estado (SP, MG)',
    example: 'SP',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de propriedades por determinado estado',
  })
  async findOne(@Param('state') state: string) {
    return this.propertiesService.findByState(state);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento da atualização de uma propriedade' })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    example: '1',
  })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiResponse({
    status: 202,
    description: 'Sucesso no enfileiramento da atualização de uma propriedade',
    schema: {
      example: {
        message: 'Property update queued successfully',
        data: {
          id: '1',
          total_area: 120,
          agricultural_area: 80,
          vegetation_area: 40,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados incorretos/propriedade não encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    this.logger.log(
      `Received request to update property: ${id}, data: ${JSON.stringify(updatePropertyDto)}`,
    );

    await this.propertiesService.validateUpdate(Number(id), updatePropertyDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'UPDATE_PROPERTY',
        id,
        data: updatePropertyDto,
      });
      this.logger.log(`Property update queued: ${id}`);

      return {
        message: 'Property update queued successfully',
        data: { id, ...updatePropertyDto },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue property update: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento da deleção de uma propriedade' })
  @ApiParam({
    name: 'id',
    description: 'Property ID',
    example: '1',
  })
  @ApiResponse({
    status: 202,
    description: 'Property deletion queued successfully',
    schema: {
      example: {
        message: 'Property deletion queued successfully',
        data: { id: '1' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  async remove(@Param('id') id: string) {
    this.logger.log(`Received request to delete property: ${id}`);

    await this.propertiesService.validateDelete(Number(id));

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'DELETE_PROPERTY',
        id,
      });
      this.logger.log(`Property deletion queued: ${id}`);

      return {
        message: 'Property deletion queued successfully',
        data: { id },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue property deletion: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
