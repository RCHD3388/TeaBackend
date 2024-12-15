import { Field, InputType } from "@nestjs/graphql";
import { IsArray, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class CreateMaterialTransactionInput {
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


@InputType()
export class MaterialDetailInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Material tidak boleh kosong' })
  material: string;

  @Field(() => Number)
  @IsNumber()
  @Min(0, { message: 'Harga tidak boleh mines' })
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  price: number;

  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Quantity tidak boleh kosong' })
  quantity: number;
}

@InputType()
export class AddInventoryMaterialInput {
  @Field(() => [MaterialDetailInput])
  @IsArray()
  @IsNotEmpty({ message: 'Material tidak boleh kosong' })
  materials: MaterialDetailInput[];

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Warehouse tidak boleh kosong' })
  warehouse: string;
}