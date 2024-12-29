import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString } from "class-validator";

@InputType()
export class FilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  readonly status?: boolean;
}
