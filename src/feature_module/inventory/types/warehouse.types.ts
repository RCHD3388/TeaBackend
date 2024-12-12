import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, isString, IsString } from "class-validator";
import { WarehouseStatus, WarehouseType } from "../schema/warehouse.schema";

@InputType()
export class CreateWarehouseInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @Field(() => String, {nullable: true})
  @IsNotEmpty({ message: 'Description is required.' })
  description?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Project should not be empty' })
  project: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Address is required.' })
  address: string;

  @Field(() => String, {nullable: true})
  @IsEnum(WarehouseStatus, { message: `Status is invalid` })
  status?: string;
  
  @Field(() => String)
  @IsEnum(WarehouseType, { message: `Type is invalid` })
  type: string;
}