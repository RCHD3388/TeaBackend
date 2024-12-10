import { Field, InputType } from "@nestjs/graphql";
import { CategoryType } from "../schema/category.schema";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Description is required.' })
  description: string;

  @Field(() => String)
  @IsEnum(CategoryType, { message: `Type is invalid` })
  type: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  @Matches(/^(?!\s*$).+/, { message: 'Name should not be empty or whitespace' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty' })
  @Matches(/^(?!\s*$).+/, { message: 'Description should not be empty or whitespace' })
  description?: string;
}

@InputType()
export class CategoryFilter {
  @Field(() => [String], {nullable: true})
  @IsOptional()
  filter?: string[]
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  type: string;
}