import { createUnionType, Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Material, Tool } from "../../inventory/schema/inventory.schema";

export enum RequestItemType {
  PEMINJAMAN = 'Peminjaman',
  PENGEMBALIAN = 'Pengembalian',
}

export enum RequestItem_ItemType {
  MATERIAL = 'Material',
  TOOL = 'Tool',
}

export enum RequestStatus {
  MENUNGGU = 'menunggu persetujuan',
  DISETUJUI = 'disetujui',
  DITOLAK = 'ditolak',
  PROSES = 'proses',
  PENGIRIMAN = 'pengiriman',
  DIBATALKAN = 'dibatalkan',
  SELESAI = 'selesai',
}

export const MaterialOrTool = createUnionType({
  name: "MaterialOrTool",
  types: () => [Material, Tool] as const,
  resolveType(value) {
    if (value.name) {
      return Material;
    }
    if (value.tool_name) {
      return Tool;
    }
    return null;
  },
});


@InputType()
export class UpdateRequestStatusInput {

  @Field(() => String)
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  @IsEnum(RequestStatus, { message: 'Status harus sesuai' })
  @IsString()
  status: String;
}

@InputType()
export class UpdateRequestInput {
  @Field(() => String, {nullable: true})
  @IsOptional()
  @IsNotEmpty({ message: 'Title tidak boleh kosong' })
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Number, {nullable: true})
  @IsNotEmpty({ message: 'Price tidak boleh kosong' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Price tidak boleh kurang dari 0' })
  price: number;
}
