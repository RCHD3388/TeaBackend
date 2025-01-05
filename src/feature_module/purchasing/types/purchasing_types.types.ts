import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { CreateToolInput } from "src/feature_module/inventory/types/tool.types";
import { RequestItem_ItemType } from "src/feature_module/request/types/request.types";
import { PurchaseOrder, PurchaseTransaction } from "../schema/purchasing.schema";
import { Material, Sku, Tool } from "src/feature_module/inventory/schema/inventory.schema";

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

  @Field(() => [CreatePODetailInput])
  @IsArray()
  @IsNotEmpty({ message: 'Detail item tidak boleh kosong' })
  purchase_order_detail: CreatePODetailInput[];
}

@InputType()
export class CreatePurchaseTransactionDetailInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Target PO tidak boleh kosong' })
  @IsString()
  purchase_order: String;

  @Field(() => String)
  @IsNotEmpty({ message: 'Item tidak boleh kosong' })
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

  @Field(() => CreateToolInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  tool?: CreateToolInput;

  @Field(() => Number)
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  @IsNumber()
  @Min(0, { message: 'Harga tidak boleh kurang dari 0' })
  price: number;
}

@InputType()
export class CreateRequestPurchaseTransactionInput {
  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  description? : string

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Nomer transaksi tidak boleh kosong' })
  transaction_number: String

  @Field(() => Date)
  @IsDate()
  @IsNotEmpty({ message: 'Tanggal transaksi tidak boleh kosong' })
  transaction_date: Date

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Supplier tidak boleh kosong' })
  supplier: String

  @Field(() => [CreatePurchaseTransactionDetailInput])
  @IsArray()
  @IsNotEmpty({ message: 'Detail item tidak boleh kosong' })
  purchase_transaction_detail: CreatePurchaseTransactionDetailInput[];
}


@InputType()
export class UpdateRequestPurchaseTransactionInput {
  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  description? : string

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nomer transaksi tidak boleh kosong' })
  transaction_number?: String

  @Field(() => Date, {nullable: true})
  @IsDate()
  @IsOptional()
  @IsNotEmpty({ message: 'Tanggal transaksi tidak boleh kosong' })
  transaction_date?: Date

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Supplier tidak boleh kosong' })
  supplier?: String
}

@InputType()
export class ReceiveItemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Nomer transaksi tidak boleh kosong' })
  item_transaction : string

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Nomer detail transaksi tidak boleh kosong' })
  item_transaction_detail : string
}

@InputType()
export class CreateNewPurchaseTransactionDetailInput {
  @Field(() => CreatePurchaseTransactionDetailInput)
  @IsNotEmpty({ message: 'Detail item tidak boleh kosong' })
  input: CreatePurchaseTransactionDetailInput;
}

@ObjectType()
export class CustomOneRequestPO {
  @Field(() => PurchaseOrder)
  purchase_order: PurchaseOrder;

  @Field(() => [Material])
  materials: Material[];

  @Field(() => [Sku])
  skus: Sku[];
}

@ObjectType()
export class CustomOneRequestPT {
  @Field(() => [PurchaseTransaction])
  purchase_transaction: PurchaseTransaction[];

  @Field(() => [Material])
  materials: Material[];

  @Field(() => [Tool])
  tools: Tool[];
}
