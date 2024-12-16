import { Field, InputType } from "@nestjs/graphql";
import { ArrayNotEmpty, IsArray, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

@InputType()
export class MaterialDetailInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Material tidak boleh kosong' })
  material: string;

  @Field(() => Number)
  @IsNumber()
  @IsOptional()
  qty: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  price?: number;
}

@InputType()
export class CreateMaterialTransactionInput {
  @Field(() => [MaterialDetailInput])
  @IsArray()
  @ArrayNotEmpty()
  materials: MaterialDetailInput[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  warehouse_to?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  warehouse_from?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Transaction Category tidak boleh kosong' })
  transaction_category: String;
}

@InputType()
export class CreateToolTransactionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Tool tidak boleh kosong' })
  tool: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  warehouse_to?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  warehouse_from?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Transaction Category tidak boleh kosong' })
  transaction_category: String;
}