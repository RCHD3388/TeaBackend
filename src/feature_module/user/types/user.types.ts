import { Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Employee } from "src/feature_module/person/schema/employee.schema";
import { UserStatus } from "../schema/user.schema";

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Employee should not be empty' })
  employee: string;
}

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Username should not be empty' })
  username?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  password?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Status should not be empty' })
  @IsEnum(UserStatus, { message: "Invalid user status" })
  status?: string;
}
