export class CreateTransactionDto {
  correlationId: string;
  accountId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
}