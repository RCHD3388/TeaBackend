import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsDate, isDate, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";

@InputType()
export class CreateProjectCostLogInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  date: Date;
  price: Number;
  category: String;
  created_by: String;
  project: String;
  request_cost?: String;
}

@InputType()
export class CreateAttendanceModuleInput {
  @Field(() => Date)
  @IsDate()
  @IsNotEmpty({ message: 'Tanggal awal tidak boleh kosong' })
  start_date: Date;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Project tidak boleh kosong' })
  project_id: string;
}

@InputType()
export class UpdateAttendanceModuleInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [UpdateAttendanceInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAttendanceInput)
  attendance: UpdateAttendanceInput[];
}

@InputType()
class UpdateAttendanceInput {
  @Field(() => Date)
  @IsDate()
  @IsNotEmpty({ message: 'Tanggal tidak boleh kosong' })
  date: Date;

  @Field(() => [UpdateAttendanceDetailInput])
  @IsArray()
  @Min(7, { message: 'Harus diisi 7 hari dalam seminggu' })
  @ValidateNested({ each: true })
  @Type(() => UpdateAttendanceDetailInput)
  attendance_detail: UpdateAttendanceDetailInput[];
}

@InputType()
class UpdateAttendanceDetailInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Employee ID tidak boleh kosong' })
  employee: string;

  @Field(() => Boolean, { nullable: true })
  @IsNotEmpty({ message: 'Check in tidak boleh kosong' })
  check_in: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsNotEmpty({ message: 'Check in tidak boleh kosong' })
  check_out: boolean;
}

