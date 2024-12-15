import { Field, InputType } from "@nestjs/graphql";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
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
  warranty_number?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  warranty_expired_date?: Date;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Harga tidak boleh mines' })
  price?: number;

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
  warranty_number?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  warranty_expired_date?: Date;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Harga tidak boleh mines' })
  price?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Sku tidak boleh kosong' })
  sku?: string;
}

@InputType()
export class FilterToolInput {
  @Field(() => String)
  @IsString()
  @IsOptional()
  sku?: string;
}