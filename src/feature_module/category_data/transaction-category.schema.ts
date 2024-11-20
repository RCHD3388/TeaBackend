import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TransactionCategory extends Document {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number, default: 0 })
  counter: number;
}

export const TransactionCategorySchema = SchemaFactory.createForClass(TransactionCategory);
