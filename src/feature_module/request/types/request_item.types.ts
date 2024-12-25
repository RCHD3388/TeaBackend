import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, IsEnum, IsArray, isEnum } from "class-validator";
import { RequestItem_ItemType, RequestItemType, RequestStatus } from "./request.types";
import { RequestItemHeader } from "../schema/request_item.schema";
import { Warehouse } from "src/feature_module/inventory/schema/warehouse.schema";

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
  @IsEnum(RequestItem_ItemType, { message: 'Tipe item harus sesuai' })
  @IsString()
  @IsNotEmpty({ message: 'Tipe item tidak boleh kosong' })
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

@ObjectType()
export class CustomRequestItem {
  @Field(() => String)
  request_item_header: RequestItemHeader;

  @Field(() => [Warehouse])
  warehouse: Warehouse[]
}

@InputType()
export class CreateProcessingDetailInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Nama pengirim tidak boleh kosong' })
  @IsString()
  sender_name: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Nomer telepon pengirim tidak boleh kosong' })
  @IsString()
  sender_phone: string;

  @Field(() => String, {nullable: true})
  @IsString()
  police_number?: string;

  @Field(() => String, {nullable: true})
  @IsString()
  vehicle_detail?: string;
}

@InputType()
export class CreateFinishingDetailInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Nama penerima tidak boleh kosong' })
  @IsString()
  recipient_name: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Nomer telepon penerima tidak boleh kosong' })
  @IsString()
  recipient_phone: string;

  @Field(() => String, {nullable: true})
  @IsString()
  recipient_description?: string;
}

