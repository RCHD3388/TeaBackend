import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class EmployeeSkill {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;
}

export const EmployeeSkillSchema = SchemaFactory.createForClass(EmployeeSkill);
