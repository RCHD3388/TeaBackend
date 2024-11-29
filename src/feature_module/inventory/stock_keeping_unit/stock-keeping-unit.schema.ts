import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StockKeepingUnit extends Document {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brand: string;

  @Prop({ type: String })
  description: string;
}

export const StockKeepingUnitSchema = SchemaFactory.createForClass(StockKeepingUnit);
