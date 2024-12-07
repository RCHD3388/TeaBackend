import { Field, InputType } from "@nestjs/graphql";
import { EmployeeProjectHistory, EmployeeRole, EmployeeSkill, EmployeeStatus } from "../schema/employee.schema";
import { Person } from "../schema/person.schema";
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export interface EmployeeDto {
  _id: string,
  id: string,
  person: Person,
  hire_date: Date,
  salary: number,
  status: string,
  role: EmployeeRole,
  project_history: EmployeeProjectHistory,
  skill: EmployeeSkill[]
}

@InputType()
export class PersonInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: String;

  @Field()
  @IsString()
  @IsEmail({}, { message: 'Email must be a valid email address' })  // Validasi email
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: String;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Phone should not be empty' })
  phone_number: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Address should not be empty' })
  address: String;
}

@InputType()
export class CreateEmployeeInput {
  @Field(() => PersonInput)
  @IsNotEmpty({ message: 'Person should not be empty' })
  @ValidateNested()
  @Type(() => PersonInput)
  person: PersonInput;

  @Field(() => String)
  @IsNotEmpty({ message: 'Hire Date should not be empty' })
  hire_date: Date;

  @Field(() => Number)
  @IsNotEmpty({ message: 'Salary should not be empty' })
  salary: number;

  @Field(() => String)
  @IsEnum(EmployeeStatus, { message: "Invalid Type Status" })
  status: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Role ID should not be empty' })
  role: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Skill ID should not be empty' })
  skill: string;
}

// UPDATE DATA EMPLOYEE

@InputType()
export class UpdateEmployeeInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Phone number should not be empty' })
  phone_number?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Address should not be empty' })
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsEnum(EmployeeStatus, { message: "Invalid Type Status" })
  status?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty({ message: 'Salary should not be empty' })
  salary?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsNotEmpty({ message: 'Hire Date should not be empty' })
  hire_date?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray({ message: 'Skills should be an array of strings' })
  @ArrayNotEmpty({ message: 'Skills should not be empty' })
  @ArrayMinSize(1, { message: 'Skills should contain at least one element' })
  @IsString({ each: true, message: 'Each skill should be a string' })
  skills?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Role should not be empty' })
  role?: string;
}

@InputType()
export class CreateEmployeeSkillInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: string;
}

@InputType()
export class UpdateEmployeeSkillInput {
  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: string;
}

