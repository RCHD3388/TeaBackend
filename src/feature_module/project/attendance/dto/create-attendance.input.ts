import { IsString, IsDate, IsNotEmpty } from 'class-validator';

export class CreateAttendanceDto {
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  created_by: string;
}
