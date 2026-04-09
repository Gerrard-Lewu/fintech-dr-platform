import { Injectable, Logger } from '@nestjs/common';
import { ServiceBusClient } from '@azure/service-bus';

@Injectable()
export class AzureService {
  private readonly logger = new Logger(AzureService.name);
  private sbClient: ServiceBusClient;

  constructor() {
    const connectionString = process.env.AZURE_SERVICEBUS_CONNECTION_STRING || '';
    if (connectionString) {
      this.sbClient = new ServiceBusClient(connectionString);
      this.logger.log('Azure Service Bus client initialized.');
    } else {
      this.logger.warn('AZURE_SERVICEBUS_CONNECTION_STRING is missing. Failover is offline.');
    }
  }

  async sendTransactionMessage(payload: any) {
    if (!this.sbClient) {
      throw new Error('Azure Service Bus Client not initialized.');
    }
    
    // Create a sender for the queue defined in Terraform
    const sender = this.sbClient.createSender('failover-transaction-queue');
    
    try {
      await sender.sendMessages({
        body: payload,
      });
    } finally {
      await sender.close();
    }
  }
}