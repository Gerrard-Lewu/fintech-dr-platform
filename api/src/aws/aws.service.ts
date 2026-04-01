import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs'

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

  // Pull messages from the queue
  async receiveMessages() {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 5, // This enables "Long Polling" to save CPU/Network
      });
      const response = await this.sqsClient.send(command);
      return response.Messages || [];
    } catch (error) {
      this.logger.error(`[SQS] Failed to receive messages: ${error.message}`);
      return [];
    }
  }

  // Delete messages once they are successfully processed
  async deleteMessage(receiptHandle: string) {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });
      await this.sqsClient.send(command);
    } catch (error) {
      this.logger.error(`[SQS] Failed to delete message: ${error.message}`);
    }
  }
}