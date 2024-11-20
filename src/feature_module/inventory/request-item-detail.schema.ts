import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RequestItemDetail extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  item: string;

  @Prop({ type: Number, required: true })
  qty: number;

  @Prop({ type: String, required: true })
  item_type: string;
}

export const RequestItemDetailSchema = SchemaFactory.createForClass(RequestItemDetail);
