import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsEmail, IsString } from "class-validator";

@InputType()
export class LoginInput {
  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType()
export class LoginResponse {
  @Field()
  username: string

  @Field()
  access_token: string
}

export class LoginDto {
  @IsEmail()
  username: string

  @IsString()
  password: string
}