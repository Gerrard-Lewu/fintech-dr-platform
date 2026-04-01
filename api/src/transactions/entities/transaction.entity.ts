import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true }) // CRITICAL: This prevents the same ID twice
  correlationId: string;

  @Column({ type: 'varchar', length: 100 })
  accountId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  type: 'CREDIT' | 'DEBIT';

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}