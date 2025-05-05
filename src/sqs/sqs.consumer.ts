import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IFarmerService } from '../farmers/interfaces/farmer-service.interface';
import { IPropertyService } from '../properties/interfaces/property-service.interface';
import { IHarvestService } from '../harvests/interfaces/harvest-service.interface';
import { ICropService } from '../crops/interfaces/crop-service.interface';

@Injectable()
export class SqsConsumer {
  private readonly logger = new Logger(SqsConsumer.name);
  private readonly sqsClient: SQSClient;

  constructor(
    private readonly configService: ConfigService,
    @Inject('FARMER_SERVICE') private readonly farmersService: IFarmerService,
    @Inject('PROPERTY_SERVICE')
    private readonly propertiesService: IPropertyService,
    @Inject('HARVEST_SERVICE')
    private readonly harvestsService: IHarvestService,
    @Inject('CROP_SERVICE') private readonly cropsService: ICropService,
  ) {
    this.logger.debug('Initializing SqsConsumer with environment variables:');
    this.logger.debug(
      `AWS_REGION: ${this.configService.get<string>('AWS_REGION')}`,
    );
    this.logger.debug(
      `AWS_ACCESS_KEY_ID: ${this.configService.get<string>('AWS_ACCESS_KEY_ID')}`,
    );
    this.logger.debug(
      `AWS_SECRET_ACCESS_KEY: ${this.configService.get<string>('AWS_SECRET_ACCESS_KEY')}`,
    );

    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.error('AWS credentials are missing');
      throw new Error(
        'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be provided',
      );
    }

    this.sqsClient = new SQSClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async consumeMessages() {
    const queueUrl = this.configService.get<string>('SQS_FARMERS_QUEUE_URL');
    if (!queueUrl) {
      this.logger.error('SQS_FARMERS_QUEUE_URL is not defined');
      return;
    }

    try {
      const receiveCommand = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 10,
      });

      const { Messages } = await this.sqsClient.send(receiveCommand);
      if (!Messages) {
        return;
      }

      this.logger.log(`Received ${Messages.length} messages from SQS`);

      for (const message of Messages) {
        const body = JSON.parse(message.Body);
        this.logger.debug(`Processing message: ${JSON.stringify(body)}`);

        try {
          if (body.action === 'CREATE_FARMER') {
            await this.farmersService.create(body.data);
            this.logger.log(
              `Successfully processed farmer creation: ${body.data.cpf_cnpj}`,
            );
          } else if (body.action === 'UPDATE_FARMER') {
            await this.farmersService.update(body.id, body.data);
            this.logger.log(`Successfully processed farmer update: ${body.id}`);
          } else if (body.action === 'DELETE_FARMER') {
            await this.farmersService.remove(Number(body.id));
            this.logger.log(
              `Successfully processed farmer deletion: ${body.id}`,
            );
          } else if (body.action === 'CREATE_PROPERTY') {
            await this.propertiesService.create(body.data);
            this.logger.log(
              `Successfully processed property creation: ${body.data.id || 'new property'}`,
            );
          } else if (body.action === 'UPDATE_PROPERTY') {
            await this.propertiesService.update(Number(body.id), body.data);
            this.logger.log(
              `Successfully processed property update: ${body.id}`,
            );
          } else if (body.action === 'DELETE_PROPERTY') {
            await this.propertiesService.remove(Number(body.id));
            this.logger.log(
              `Successfully processed property deletion: ${body.id}`,
            );
          } else if (body.action === 'CREATE_HARVEST') {
            await this.harvestsService.create(body.data);
            this.logger.log(
              `Successfully processed harvest creation: ${body.data.id || 'new harvest'}`,
            );
          } else if (body.action === 'UPDATE_HARVEST') {
            await this.harvestsService.update(Number(body.id), body.data);
            this.logger.log(
              `Successfully processed harvest update: ${body.id}`,
            );
          } else if (body.action === 'DELETE_HARVEST') {
            await this.harvestsService.remove(Number(body.id));
            this.logger.log(
              `Successfully processed harvest deletion: ${body.id}`,
            );
          } else if (body.action === 'CREATE_CROP') {
            await this.cropsService.create(body.data);
            this.logger.log(
              `Successfully processed crop creation: ${body.data.id || 'new crop'}`,
            );
          } else if (body.action === 'UPDATE_CROP') {
            await this.cropsService.update(Number(body.id), body.data);
            this.logger.log(`Successfully processed crop update: ${body.id}`);
          } else if (body.action === 'DELETE_CROP') {
            await this.cropsService.remove(Number(body.id));
            this.logger.log(`Successfully processed crop deletion: ${body.id}`);
          } else {
            this.logger.warn(`Unknown action: ${body.action}`);
            throw new Error(`Unsupported action: ${body.action}`);
          }

          const deleteCommand = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          });
          await this.sqsClient.send(deleteCommand);
          this.logger.debug(`Deleted message: ${message.MessageId}`);
        } catch (error) {
          this.logger.error(
            `Failed to process message: ${error.message}`,
            error.stack,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to consume SQS messages: ${error.message}`,
        error.stack,
      );
    }
  }
}
