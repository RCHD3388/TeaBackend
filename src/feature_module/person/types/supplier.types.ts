import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { PersonInput } from "./employee.types";
import { SupplierStatus } from "../schema/supplier.schema";

@InputType()
export class CreateSupplierInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Company Name should not be empty' })
  name: string;

  @Field(() => PersonInput)
  @IsNotEmpty({ message: 'Person should not be empty' })
  @ValidateNested()
  @Type(() => PersonInput)
  person: PersonInput;

  @Field(() => String)
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsEnum(SupplierStatus, { message: "Invalid Type Status" })
  status: string;  
}

@InputType()
export class UpdateSupplierInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Company name should not be empty' })
  company_name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Phone number should not be empty' })
  phone_number?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Address should not be empty' })
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(SupplierStatus, { message: "Invalid Type Status" })
  status?: string;
}
