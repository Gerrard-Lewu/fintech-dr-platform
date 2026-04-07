import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { AwsModule } from '../aws/aws.module';
import { makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { AzureModule } from '../azure/azure.module';

@Module({
  // Import the TypeORM feature to recognize the Transaction entity
  imports: [
    TypeOrmModule.forFeature([Transaction]), 
    AwsModule,
    AzureModule // Add to the imports array
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    makeCounterProvider({
      name: 'fintech_transactions_total',
      help: 'Total number of transactions processed by the API',
    }),
  ],
})
export class TransactionsModule {}