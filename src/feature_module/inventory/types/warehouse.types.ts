import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsOptional, isString, IsString } from "class-validator";
import { WarehouseStatus, WarehouseType } from "../schema/warehouse.schema";

@InputType()
export class CreateWarehouseInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Project should not be empty' })
  project?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Address is required.' })
  address: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsEnum(WarehouseStatus, { message: `Status is invalid` })
  status?: string;
  
  type: string;
}

@InputType()
export class UpdateWarehouseInput {
  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  description?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Address is required.' })
  address?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsEnum(WarehouseStatus, { message: `Status is invalid` })
  status?: string;
}