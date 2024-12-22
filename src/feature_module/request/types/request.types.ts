import { createUnionType, Field, InputType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Material, Tool } from "src/feature_module/inventory/schema/inventory.schema";

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