import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, isString, IsString, minLength } from "class-validator";

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Username tidak boleh kosong.' })
  username: string

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  password: string
}

@ObjectType()
export class LoginResponse {
  @Field()
  _id: string

  @Field()
  username: string

  @Field()
  role: string

  @Field()
  access_token: string

  @Field()
  name: string
}

export interface LoginDto {
  username: string;
  password: string;
}