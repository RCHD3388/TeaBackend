import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RequestStatus } from "./request.types";

@InputType()
export class CreateRequestClosingInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Proyek asal tidak boleh kosong' })
  @IsString()
  requested_from: String;
}