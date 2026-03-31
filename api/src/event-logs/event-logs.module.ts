import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventLogsService } from './event-logs.service';
import { EventLogsController } from './event-logs.controller';
import { EventLog, EventLogSchema } from './entities/event-log.entity';

@Module({
  // Import the Mongoose feature to recognize the EventLog schema
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
    ]),
  ],
  controllers: [EventLogsController],
  providers: [EventLogsService],
})
export class EventLogsModule {}