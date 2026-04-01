export class CreateTransactionDto {
  accountId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
}