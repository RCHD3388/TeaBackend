import { CategoryData, CategoryType, TransactionCategory } from "./../../../feature_module/category/schema/category.schema";

export const categoryData: Partial<CategoryData>[] = [
  { name: "Sukses", description: "proses sudah selesai", type: CategoryType.COMPLETION_STATUS },
  { name: "Proses", description: "sedang dalam proses penyelesaian", type: CategoryType.COMPLETION_STATUS },
  { name: "Berhenti", description: "proses penyelesaian diberhentikan", type: CategoryType.COMPLETION_STATUS },
]

export const transactionCategoryData: Partial<TransactionCategory>[] = [
  { id: "PUR", description: "Transfer hasil pembelian perusahaan ke warehouse tertentu" },
  { id: "TRF", description: "Hasil transfer antar warehouse atau gudang proyek" },
  { id: "ADD", description: "Penambahan langsung ke warehouse atau gudang" },
  { id: "USE", description: "Penggunaan langsung dari warehouse atau gudang" },
  { id: "SND", description: "Dalam proses pengiriman warehouse atau gudang" },
  { id: "REC", description: "Penerimaan hasil kiriman warehouse atau gudang" },
]