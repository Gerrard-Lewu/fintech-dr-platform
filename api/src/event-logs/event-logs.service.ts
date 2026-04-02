import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventLogDto } from './dto/create-event-log.dto';
import { UpdateEventLogDto } from './dto/update-event-log.dto';
import { EventLog, EventLogDocument } from './entities/event-log.entity';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class EventLogsService implements OnModuleInit {
  private readonly logger = new Logger(EventLogsService.name);

  constructor(
    @InjectModel(EventLog.name) private eventLogModel: Model<EventLogDocument>,
    private awsService: AwsService, // Inject AWS wrapper
  ) {}

  // This lifecycle hook fires automatically when the app starts
  async onModuleInit() {
    this.logger.log('Waiting 15 seconds for LocalStack to initialize...');
    // This delay prevents the "QueueDoesNotExist" or "Connection Refused" errors
    await new Promise(resolve => setTimeout(resolve, 20000)); 
    
    this.logger.log('Starting SQS Consumer for Event Logs...');
    this.pollQueue();
  }

  private async pollQueue() {
    // Infinite loop that continuously checks SQS for new messages
    while (true) {
      try {
        const messages = await this.awsService.receiveMessages();
        
        for (const message of messages) {
          this.logger.log(`Processing SQS message: ${message.MessageId}`);

          // 1. Parse the JSON payload we sent from the Transactions Service
          const payload = JSON.parse(message.Body!);

          // 2. Save it directly to MongoDB as an immutable audit log
          const newLog = new this.eventLogModel({
            transactionId: payload.data.id,
            eventType: payload.eventType,
            source: payload.source,
            payload: payload,
          });
          await newLog.save();
          this.logger.log(`Saved EventLog to MongoDB for transaction: ${payload.data.id}`);

          // 3. Delete the message from SQS so it isn't processed twice
          await this.awsService.deleteMessage(message.ReceiptHandle!);
          this.logger.log(`Deleted message ${message.MessageId} from queue`);
        }
      } catch (error) {
        this.logger.error('Error polling SQS queue', error);
        // If something completely breaks, wait 5 seconds before trying again 
        // to prevent an aggressive infinite error loop
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  create(createEventLogDto: CreateEventLogDto) {
    return 'This action adds a new eventLog';
  }

  findAll() {
    return `This action returns all eventLogs`;
  }

  findOne(id: string) {
    return `This action returns a #${id} eventLog`;
  }

  update(id: string, updateEventLogDto: UpdateEventLogDto) {
    return `This action updates a #${id} eventLog`;
  }

  remove(id: string) {
    return `This action removes a #${id} eventLog`;
  }
}
