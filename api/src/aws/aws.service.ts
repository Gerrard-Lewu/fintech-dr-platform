import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class AwsService {
  private readonly sqsClient: SQSClient;
  private readonly logger = new Logger(AwsService.name);
  private readonly queueUrl: string;

  constructor(private configService: ConfigService) {
    // Initialize the SQS Client pointing to LocalStack
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION')!,
      endpoint: this.configService.get<string>('SQS_ENDPOINT')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    
    // Grabs the specific Queue URL
    this.queueUrl = this.configService.get<string>('SQS_TRANSACTION_QUEUE_URL')!;
  }

  // Method to push data to the queue
  async sendTransactionMessage(payload: any) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(payload),
      });

      const response = await this.sqsClient.send(command);
      this.logger.log(`[SQS] Transaction message sent! MessageId: ${response.MessageId}`);
      return response;
    } catch (error) {
      this.logger.error(`[SQS] Failed to send message: ${error.message}`, error.stack);
      throw error;
    }
  }
}