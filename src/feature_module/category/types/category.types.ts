import { Field, InputType } from "@nestjs/graphql";
import { CategoryType, CetegoryStatusType } from "../schema/category.schema";
import { IsEnum, IsNotEmpty, IsOptional, isString, IsString, Matches } from "class-validator";

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @Field(() => String, {nullable: true})
  @IsString()
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
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(CetegoryStatusType, { message: `Tipe invalid` })
  status?: string;
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