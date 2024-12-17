import { createUnionType } from "@nestjs/graphql";
import { Material, Tool } from "src/feature_module/inventory/schema/inventory.schema";

export enum RequestItemType {
  PEMINJAMAN = 'peminjaman',
  PENGEMBALIAN = 'pengembalian',
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