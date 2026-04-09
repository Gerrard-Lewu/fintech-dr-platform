import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { AwsService } from '../aws/aws.service';
import { AzureService } from '../azure/azure.service';
import { getToken } from '@willsoto/nestjs-prometheus';

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        // Mock the Postgres Repository
        { provide: getRepositoryToken(Transaction), useValue: {} },
        // Mock the AWS Service
        { provide: AwsService, useValue: {} },
        // Add the AzureService Mock
        { provide: AzureService, useValue: { sendTransactionMessage: jest.fn() } },
        // Mock the Prometheus Counter
        { provide: getToken('fintech_transactions_total'), useValue: { inc: jest.fn() } },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
