import { Test, TestingModule } from '@nestjs/testing';
import { EventLogsService } from './event-logs.service';
import { getModelToken } from '@nestjs/mongoose';
import { AwsService } from '../aws/aws.service';
import { EventLog } from './entities/event-log.entity';

describe('EventLogsService', () => {
  let service: EventLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventLogsService,
        // Mock the MongoDB Model
        { provide: getModelToken(EventLog.name), useValue: {} },
        // Mock the AWS Service
        { provide: AwsService, useValue: {} },
      ],
    }).compile();

    service = module.get<EventLogsService>(EventLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
