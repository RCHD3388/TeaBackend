import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { RequestItem_ItemType } from "src/feature_module/request/types/request.types";

@InputType()
export class CreatePODetailInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'item tidak boleh kosong' })
  @IsString()
  item: String;

  @Field(() => Number)
  @IsNotEmpty({ message: 'Quantity tidak boleh kosong' })
  @IsNumber()
  @Min(1, { message: 'Quantity minimal 1' })
  quantity: number;

  @Field(() => String)
  @IsEnum(RequestItem_ItemType, { message: 'Tipe item harus sesuai' })
  @IsString()
  @IsNotEmpty({ message: 'Tipe item tidak boleh kosong' })
  item_type: String;
}

@InputType()
export class CreateRequestPOInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Diminta dari tidak boleh kosong' })
  @IsString()
  requested_from: String;

  @Field(() => String)
  @IsNotEmpty({ message: 'Tujuan gudang tidak boleh kosong' })
  @IsString()
  requested_to: String;

  @Field(() => [CreatePODetailInput])
  @IsArray()
  @IsNotEmpty({ message: 'Detail item tidak boleh kosong' })
  purchase_order_detail: CreatePODetailInput[];
}