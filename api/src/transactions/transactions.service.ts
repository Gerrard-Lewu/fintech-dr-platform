import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private awsService: AwsService, // <-- Inject your AWS Service
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    // 1. Save the structured data to PostgreSQL
    const newTransaction = this.transactionRepository.create(createTransactionDto);
    const savedTransaction = await this.transactionRepository.save(newTransaction);
    this.logger.log(`Saved transaction ${savedTransaction.id} to Postgres`);

    // 2. Fire an event to AWS SQS for the DR/Audit pipeline
    try {
      await this.awsService.sendTransactionMessage({
        eventType: 'TRANSACTION_CREATED',
        source: 'CORE_API',
        data: savedTransaction,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to send transaction ${savedTransaction.id} to SQS`, error.stack);
    }

    return savedTransaction;
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