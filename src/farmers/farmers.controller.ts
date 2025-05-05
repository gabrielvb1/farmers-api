import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
  Delete,
  Get,
} from '@nestjs/common';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { SqsService } from '../sqs/sqs.service';
import { ConfigService } from '@nestjs/config';
import { IFarmerService } from './interfaces/farmer-service.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('farmers')
@Controller('farmers')
export class FarmersController {
  private readonly logger = new Logger(FarmersController.name);

  constructor(
    @Inject('FARMER_SERVICE') private readonly farmersService: IFarmerService,
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento para a criação de um proprietário' })
  @ApiBody({
    type: CreateFarmerDto,
    description: 'Objeto para criação de uma nova propriedade',
  })
  @ApiResponse({
    status: 202,
    description: 'Farmer creation queued successfully',
    schema: {
      example: {
        message: 'Farmer creation queued successfully',
        data: {
          name: 'Roberto Silva',
          cpf_cnpj: '95076617003',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'CPF/CNPJ ou Nome inválidos',
  })
  async create(@Body() createFarmerDto: CreateFarmerDto) {
    this.logger.log(
      `Received request to create farmer: ${JSON.stringify(createFarmerDto)}`,
    );

    await this.farmersService.validateFarmer(createFarmerDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'CREATE_FARMER',
        data: createFarmerDto,
      });
      this.logger.log(`Farmer creation queued: ${createFarmerDto.cpf_cnpj}`);

      return {
        message: 'Farmer creation queued successfully',
        data: createFarmerDto,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue farmer creation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento da atualização de um proprietário' })
  @ApiParam({
    name: 'id',
    description: 'Farmer ID',
    example: '1',
  })
  @ApiBody({ type: UpdateFarmerDto })
  @ApiResponse({
    status: 202,
    description: 'Farmer update queued successfully',
    schema: {
      example: {
        message: 'Farmer update queued successfully',
        data: {
          id: '1',
          name: 'Roberto Silva',
          cpf_cnpj: '02933701502',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nome ou CPF/CNPJ ou farmer não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFarmerDto: UpdateFarmerDto,
  ) {
    this.logger.log(
      `Received request to update farmer: ${id}, data: ${JSON.stringify(updateFarmerDto)}`,
    );

    await this.farmersService.validateUpdate(Number(id), updateFarmerDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'UPDATE_FARMER',
        id,
        data: updateFarmerDto,
      });
      this.logger.log(`Farmer update queued: ${id}`);

      return {
        message: 'Farmer update queued successfully',
        data: { id, ...updateFarmerDto },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue farmer update: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Busca todos os proprietários cadastrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os proprietários cadastrados',
  })
  @ApiResponse({
    status: 404,
    description: 'Não há fazendeiros cadastrados',
  })
  async findAll() {
    return this.farmersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca proprietário pelo ID' })
  @ApiParam({
    name: 'id',
    description: 'Farmer ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do proprietários',
  })
  @ApiResponse({
    status: 404,
    description: 'Farmer not found',
  })
  async findOne(@Param('id') id: string) {
    return this.farmersService.findOne(+id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento para exclusão de um proprietário' })
  @ApiParam({
    name: 'id',
    description: 'Farmer ID',
    example: '1',
  })
  @ApiResponse({
    status: 202,
    description: 'Farmer deletion queued successfully',
    schema: {
      example: {
        message: 'Farmer deletion queued successfully',
        data: { id: '1' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Proprietário não encontrado',
  })
  async remove(@Param('id') id: string) {
    await this.farmersService.findOne(Number(id));

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'DELETE_FARMER',
        id,
      });
      this.logger.log(`Farmer deletion queued: ${id}`);

      return {
        message: 'Farmer deletion queued successfully',
        data: { id },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue farmer deletion: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
