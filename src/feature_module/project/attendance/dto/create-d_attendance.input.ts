import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAttendanceDetailDto {
  @IsString()
  @IsNotEmpty()
  employee: string;

  @IsBoolean()
  @IsNotEmpty()
  check_in: boolean;
  @IsBoolean()
  @IsNotEmpty()
  check_out: boolean;

  @IsString()
  @IsOptional()
  note?: string;
}
