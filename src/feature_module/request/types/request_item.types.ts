import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, IsEnum, IsArray } from "class-validator";
import { RequestItemType, RequestStatus } from "./request.types";

@InputType()
export class CreateRequestItemDetailInput {
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
  @IsNotEmpty({ message: 'Tipe item tidak boleh kosong' })
  @IsString()
  item_type: String;
}

@InputType()
export class CreateRequestItemInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Tipe transaksi tidak boleh kosong' })
  @IsEnum(RequestItemType, { message: 'Tipe transaksi harus sesuai' })
  @IsString()
  type: string;

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

  @Field(() => [CreateRequestItemDetailInput])
  @IsArray()
  @IsNotEmpty({ message: 'Detail item tidak boleh kosong' })
  request_item_detail: CreateRequestItemDetailInput[];
}

@InputType()
export class UpdateRequestItemStatusInput {

  @Field(() => String)
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  @IsEnum(RequestStatus, { message: 'Status harus sesuai' })
  @IsString()
  status: String;
}

