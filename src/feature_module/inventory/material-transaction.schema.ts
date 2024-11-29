import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MaterialTransaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Material', required: true })
  material: string;
  
  @Prop({ type: Number, required: true })
  in: number;
  
  @Prop({ type: Number, required: true })
  out: number;
  
  @Prop({ type: Number, required: true })
  price: number;
  
  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
  warehouse: string;

  @Prop({ type: String, required: true })
  transaction_code: string;

  @Prop({ type: Types.ObjectId, ref: 'TransactionCategory', required: true })
  transaction_category: string;

  @Prop({ type: Date, required: true })
  date: Date;
}

export const MaterialTransactionSchema = SchemaFactory.createForClass(MaterialTransaction);
