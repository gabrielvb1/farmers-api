import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { IHarvestService } from './interfaces/harvest-service.interface';
import { SqsService } from '../sqs/sqs.service';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('harvests')
@Controller('harvests')
export class HarvestsController {
  private readonly logger = new Logger(HarvestsController.name);

  constructor(
    @Inject('HARVEST_SERVICE')
    private readonly harvestsService: IHarvestService,
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento para a criação de uma safra' })
  @ApiBody({
    type: CreateHarvestDto,
    description: 'Objeto para criação de uma nova safra',
  })
  @ApiResponse({
    status: 202,
    description: 'Safra enfileirada para criação com sucesso',
    schema: {
      example: {
        message: 'Harvest creation queued successfully',
        data: {
          year: 2023,
          property_id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Ano ou propriedade inválidos',
  })
  async create(@Body() createHarvestDto: CreateHarvestDto) {
    this.logger.log(
      `Received request to create harvest: ${JSON.stringify(createHarvestDto)}`,
    );

    await this.harvestsService.validateCreate(createHarvestDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'CREATE_HARVEST',
        data: createHarvestDto,
      });
      this.logger.log(`Harvest creation queued`);

      return {
        message: 'Harvest creation queued successfully',
        data: createHarvestDto,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue harvest creation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento da atualização de uma safra' })
  @ApiParam({
    name: 'id',
    description: 'ID da safra',
    example: '1',
  })
  @ApiBody({
    type: UpdateHarvestDto,
    description: 'Objeto para atualização de uma safra',
  })
  @ApiResponse({
    status: 202,
    description: 'Safra enfileirada para atualização com sucesso',
    schema: {
      example: {
        message: 'Harvest update queued successfully',
        data: {
          id: '1',
          year: 2024,
          property_id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Ano, propriedade ou safra não encontrada',
  })
  async update(
    @Param('id') id: string,
    @Body() updateHarvestDto: UpdateHarvestDto,
  ) {
    this.logger.log(
      `Received request to update harvest: ${id}, data: ${JSON.stringify(updateHarvestDto)}`,
    );

    await this.harvestsService.validateUpdate(Number(id), updateHarvestDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'UPDATE_HARVEST',
        id,
        data: updateHarvestDto,
      });
      this.logger.log(`Harvest update queued: ${id}`);

      return {
        message: 'Harvest update queued successfully',
        data: { id, ...updateHarvestDto },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue harvest update: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento para exclusão de uma safra' })
  @ApiParam({
    name: 'id',
    description: 'ID da safra',
    example: '1',
  })
  @ApiResponse({
    status: 202,
    description: 'Safra enfileirada para exclusão com sucesso',
    schema: {
      example: {
        message: 'Harvest deletion queued successfully',
        data: { id: '1' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Safra não encontrada',
  })
  async remove(@Param('id') id: string) {
    this.logger.log(`Received request to delete harvest: ${id}`);

    await this.harvestsService.validateDelete(Number(id));

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'DELETE_HARVEST',
        id,
      });
      this.logger.log(`Harvest deletion queued: ${id}`);

      return {
        message: 'Harvest deletion queued successfully',
        data: { id },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue harvest deletion: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
