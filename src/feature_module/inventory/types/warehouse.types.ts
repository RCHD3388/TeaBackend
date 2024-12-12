import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty } from "class-validator";
import { WarehouseStatus, WarehouseType } from "../schema/warehouse.schema";

@InputType()
export class CreateWarehouseInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Description is required.' })
  description: string;

  @Field(() => String)
  @IsEnum(WarehouseStatus, { message: `Status is invalid` })
  status: string;
  
  @Field(() => String)
  @IsEnum(WarehouseType, { message: `Type is invalid` })
  type: string;
}