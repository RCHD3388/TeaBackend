import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateTaskInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Lokasi tidak boleh kosong' })
  location: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  description: string;

  @Field(() => Date)
  @IsDate()
  @IsNotEmpty({ message: 'Tanggal target tidak boleh kosong' })
  target_date: Date;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Prioritas tidak boleh kosong' })
  priority: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Pemimpin proyek tidak boleh kosong' })
  project_leader: string;
}
