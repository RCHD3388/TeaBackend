import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty({ message: 'Lokasi tidak boleh kosong' })
  location: string;

  @Field(() => String, {nullable: true})
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Date, {nullable: true})
  @IsDate()
  @IsOptional()
  target_date?: Date;

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

@InputType()
export class UpdateProjectInput {
  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Lokasi tidak boleh kosong' })
  location?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tidak boleh kosong' })
  description?: string;

  @Field(() => Date, {nullable: true})
  @IsOptional()
  @IsDate()
  @IsNotEmpty({ message: 'Tanggal target tidak boleh kosong' })
  target_date?: Date;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Prioritas tidak boleh kosong' })
  priority?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  status?: string;

  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Pemimpin proyek tidak boleh kosong' })
  project_leader?: string;
}
