import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsDate, IsNumber } from 'class-validator';

@InputType()
export class CreateToolInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  waranty_number?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  waranty_expiration_date?: Date;

  @Field(() => String, { nullable: false })
  @IsString()
  status: string;

  @Field(() => Number)
  @IsNumber()
  price: number;

  @Field(() => String)
  @IsString()
  item_category: string;

  @Field(() => String)
  @IsString()
  stock_keeping_unit: string;
}
