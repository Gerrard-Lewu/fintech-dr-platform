import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventLogDocument = HydratedDocument<EventLog>;

@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt
export class EventLog {
  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  eventType: string; // e.g., 'TRANSACTION_CREATED', 'FRAUD_FLAGGED'

  @Prop({ required: true })
  source: string; // e.g., 'API', 'SQS', 'System'

  @Prop({ required: true, type: Object })
  payload: Record<string, any>; // The raw JSON dump of the data
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);