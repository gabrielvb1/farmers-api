import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { ICropService } from './interfaces/crop-service.interface';
import { SqsService } from '../sqs/sqs.service';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('crops')
@Controller('crops')
export class CropsController {
  private readonly logger = new Logger(CropsController.name);

  constructor(
    @Inject('CROP_SERVICE') private readonly cropsService: ICropService,
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento para a criação de uma cultura' })
  @ApiBody({
    type: CreateCropDto,
    description: 'Objeto para criação de uma nova cultura',
  })
  @ApiResponse({
    status: 202,
    description: 'Cultura enfileirada para criação com sucesso',
    schema: {
      example: {
        message: 'Crop creation queued successfully',
        data: {
          name: 'Milho',
          harvest_id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nome ou safra inválidos',
  })
  async create(@Body() createCropDto: CreateCropDto) {
    this.logger.log(
      `Received request to create crop: ${JSON.stringify(createCropDto)}`,
    );

    await this.cropsService.validateCreate(createCropDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'CREATE_CROP',
        data: createCropDto,
      });
      this.logger.log(`Crop creation queued`);

      return {
        message: 'Crop creation queued successfully',
        data: createCropDto,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue crop creation: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento da atualização de uma cultura' })
  @ApiParam({
    name: 'id',
    description: 'ID da cultura',
    example: '1',
  })
  @ApiBody({
    type: UpdateCropDto,
    description: 'Objeto para atualização de uma cultura',
  })
  @ApiResponse({
    status: 202,
    description: 'Cultura enfileirada para atualização com sucesso',
    schema: {
      example: {
        message: 'Crop update queued successfully',
        data: {
          id: '1',
          name: 'Soja',
          harvest_id: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nome, safra ou cultura não encontrada',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCropDto: UpdateCropDto,
  ) {
    this.logger.log(
      `Received request to update crop: ${id}, data: ${JSON.stringify(updateCropDto)}`,
    );

    await this.cropsService.validateUpdate(id, updateCropDto);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'UPDATE_CROP',
        id,
        data: updateCropDto,
      });
      this.logger.log(`Crop update queued: ${id}`);

      return {
        message: 'Crop update queued successfully',
        data: { id, ...updateCropDto },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue crop update: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Enfileiramento para exclusão de uma cultura' })
  @ApiParam({
    name: 'id',
    description: 'ID da cultura',
    example: '1',
  })
  @ApiResponse({
    status: 202,
    description: 'Cultura enfileirada para exclusão com sucesso',
    schema: {
      example: {
        message: 'Crop deletion queued successfully',
        data: { id: '1' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cultura não encontrada',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Received request to delete crop: ${id}`);

    await this.cropsService.validateDelete(id);

    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      throw new Error('SQS queue URL is missing');
    }

    try {
      await this.sqsService.sendMessage(queueUrl, {
        action: 'DELETE_CROP',
        id,
      });
      this.logger.log(`Crop deletion queued: ${id}`);

      return {
        message: 'Crop deletion queued successfully',
        data: { id },
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue crop deletion: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
