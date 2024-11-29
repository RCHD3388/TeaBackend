import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Tool extends Document {
  @Prop({ type: String, required: true, unique: true })
  id: string;
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  serial_number: string;

  @Prop({ type: Date })
  warranty_expiration_date: Date;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'StockKeepingUnit', required: true })
  stock_keeping_unit: string;

  @Prop({ type: Types.ObjectId, ref: 'CategoryData', required: true })
  item_category: string;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
