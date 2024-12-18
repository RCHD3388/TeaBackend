import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

@InputType()
export class CreateProjectCostLogInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  date: Date;
  price: Number;
  category: String;
  created_by: String;
  project: String;
  request_cost?: String;
}