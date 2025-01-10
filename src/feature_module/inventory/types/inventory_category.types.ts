import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { MaterialStatus } from "../schema/inventory.schema";

@InputType()
export class CreateInventoryCategoryInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name tidak boleh kosong.' })
  name: string;

  @Field(() => String, {nullable: true})
  @IsString()
  @IsOptional()
  description?: string;
}

@InputType()
export class UpdateInventoryCategoryInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name tidak boleh kosong' })
  @Matches(/^(?!\s*$).+/, { message: 'Name tidak boleh kosong' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class CreateSkuInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Name tidak boleh kosong.' })
  name: string;

  @Field(() => String, {nullable: true})
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Merk tidak boleh kosong.' })
  merk: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Kategori item tidak boleh kosong' })
  item_category: string;
}

@InputType()
export class UpdateSkuInput {
  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name tidak boleh kosong.' })
  name: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String)
  @IsOptional()
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsEnum(MaterialStatus, { message: "Invalid Type Status" })
  status: string;
  
  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Merk tidak boleh kosong.' })
  merk: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Kategori item tidak boleh kosong' })
  item_category: string;
}