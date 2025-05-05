import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly sqsClient: SQSClient;

  constructor(private readonly configService: ConfigService) {
    this.logger.debug('Initializing SqsService with environment variables:');
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

  async sendMessage(queueUrl: string, messageBody: any): Promise<void> {
    this.logger.debug(`Sending message to queue: ${queueUrl}`);
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(messageBody),
      });

      await this.sqsClient.send(command);
      this.logger.log(`Message sent to queue: ${queueUrl}`);
    } catch (error) {
      this.logger.error(
        `Failed to send message: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
