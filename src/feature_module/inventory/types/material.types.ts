import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { MaterialStatus } from "../schema/inventory.schema";

@InputType()
export class CreateMaterialInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Merk tidak boleh kosong' })
  merk: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Satuan Unit tidak boleh kosong' })
  unit_measure: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsEnum(MaterialStatus, { message: "Invalid Type Status" })
  status: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Satuan Unit terkecil tidak boleh kosong' })
  minimum_unit_measure: string;

  @Field(() => Number)
  @IsNumber()
  @Min(1, { message: 'Konversi minimal 1' })
  @IsNotEmpty({ message: 'Konversi tidak boleh kosong' })
  conversion: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Kategori item tidak boleh kosong' })
  item_category: string;
}

@InputType()
export class UpdateMaterialInput {
  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Merk tidak boleh kosong' })
  merk: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Satuan Unit tidak boleh kosong' })
  unit_measure: string;

  @Field(() => String)
  @IsOptional()
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsEnum(MaterialStatus, { message: "Invalid Type Status" })
  status: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Satuan Unit terkecil tidak boleh kosong' })
  minimum_unit_measure: string;

  @Field(() => Number)
  @IsNumber()
  @IsOptional()
  @IsNotEmpty({ message: 'Konversi tidak boleh kosong' })
  conversion: number;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Kategori item tidak boleh kosong' })
  item_category: string;
}