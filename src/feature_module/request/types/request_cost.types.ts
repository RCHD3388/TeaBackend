import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from "class-validator";
import { Types } from "mongoose";

@InputType()
export class CreateRequestCostInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Kategori biaya proyek tidak boleh kosong' })
  @IsString()
  project_cost_category: String;

  @Field(() => String)
  @IsNotEmpty({ message: 'Diminta dari tidak boleh kosong' })
  @IsString()
  requested_from: String;

  @Field(() => Number)
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  @IsNumber()
  @Min(0, { message: 'Harga tidak boleh kurang dari 0' })
  price: number;
}

@InputType()
export class UpdateRequestCostStatusInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Id request tidak boleh kosong' })
  @IsString()
  id: String;

  @Field(() => String)
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  @IsString()
  status: String;
}

