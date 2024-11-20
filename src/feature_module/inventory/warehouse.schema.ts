import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Warehouse extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ToolTransaction' }] })
  tool_transaction: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'MaterialTransaction' }] })
  material_transaction: string[];
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
