import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { AwsService } from '../aws/aws.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { AzureService } from '../azure/azure.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private awsService: AwsService,
    private azureService: AzureService,

    @InjectMetric('fintech_transactions_total') 
    private readonly transactionCounter: Counter,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    try {
      // 1. Save to PostgreSQL
      const newTransaction = this.transactionRepository.create(createTransactionDto);
      const savedTransaction = await this.transactionRepository.save(newTransaction);
      
      this.logger.log(`Saved transaction ${savedTransaction.id} to Postgres`);
      this.transactionCounter.inc();

      const payload = {
        eventType: 'TRANSACTION_CREATED',
        source: 'CORE_API',
        data: savedTransaction,
        timestamp: new Date().toISOString(),
      };

      try {
        await this.awsService.sendTransactionMessage(payload);
        this.logger.log(`[Primary Route] Transaction sent to AWS SQS successfully.`);
      } 
      // 3. FAILOVER ROUTE: The Circuit Breaker trips if AWS fails
      catch (awsError) {
        this.logger.error(`[CRITICAL] AWS SQS Failed! Tripping Circuit Breaker to Azure. Error: ${awsError.message}`);
        
        try {
          await this.azureService.sendTransactionMessage(payload);
          this.logger.log(`[Failover Route] Transaction rescued and sent to Azure Service Bus.`);
        } catch (azureError) {
          // If BOTH clouds fail, the system is truly down.
          this.logger.fatal(`[CATASTROPHIC] Both AWS and Azure are down. Transaction ${savedTransaction.id} stuck in Postgres.`);
          throw new Error('Multi-Cloud Messaging Failure');
        }
      }

      return savedTransaction;
    } catch (error) {
      if (error.code === '23505') {
        this.logger.warn(`Duplicate transaction blocked: ${createTransactionDto.correlationId}`);
        throw new ConflictException('Transaction with this Correlation ID already processed');
      }
      throw error;
    }
  }

  findAll() {
    return this.transactionRepository.find();
  }

  findOne(id: string) {
    return this.transactionRepository.findOneBy({ id });
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: string) {
    return `This action removes a #${id} transaction`;
  }
}