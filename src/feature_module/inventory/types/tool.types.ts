import { Field, InputType } from "@nestjs/graphql";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { MaterialStatus } from "../schema/inventory.schema";

@InputType()
export class CreateToolInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  warranty_number: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  warranty_expired_date: Date;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status: string;

  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Price tidak boleh kosong' })
  price: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Sku tidak boleh kosong' })
  sku: string;
}

@InputType()
export class UpdateToolInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  warranty_number: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  warranty_expired_date: Date;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status: string;

  @Field(() => Number)
  @IsNumber()
  @IsOptional()
  @IsNotEmpty({ message: 'Price tidak boleh kosong' })
  price: number;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Sku tidak boleh kosong' })
  sku: string;
}