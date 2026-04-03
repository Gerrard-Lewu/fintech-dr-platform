import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { AwsService } from '../aws/aws.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private awsService: AwsService,

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

      // 2. Fire an event to AWS SQS
      await this.awsService.sendTransactionMessage({
        eventType: 'TRANSACTION_CREATED',
        source: 'CORE_API',
        data: savedTransaction,
        timestamp: new Date().toISOString(),
      });

      return savedTransaction;
    } catch (error) {
      // Check for Postgres Unique Constraint Violation (Error 23505)
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