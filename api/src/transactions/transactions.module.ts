import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { AwsModule } from '../aws/aws.module';

@Module({
  // Import the TypeORM feature to recognize the Transaction entity
  imports: [
    TypeOrmModule.forFeature([Transaction]), 
    AwsModule // Add to the imports array
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}