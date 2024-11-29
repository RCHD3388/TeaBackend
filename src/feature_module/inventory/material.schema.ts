import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Material extends Document {
  @Prop({ type: String, required: true, unique: true })
  id: string;
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'UnitMeasure', required: true })
  unit_measure: string;

  @Prop({ type: Types.ObjectId, ref: 'UnitMeasure', required: true })
  minimum_unit_measure: string;

  @Prop({ type: Number, required: true })
  conversion: number;

  @Prop({ type: Types.ObjectId, ref: 'CategoryData', required: true })
  item_category: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
