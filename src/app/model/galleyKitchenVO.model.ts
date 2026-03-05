export interface GalleyKitchenVO {
  itemId?: number;
  itemName?: string;
  categoryId?: number;
  categoryName?: string;
  packSize?: string;
  landingPrice?: number; // BigDecimal -> number
  landingType?: string;
  landingTax?: number; // BigDecimal -> number
  sellingPrice?: number; // BigDecimal -> number
  sellingTax?: number; // BigDecimal -> number
  createdBy?: string;
  creationDate?: string; // LocalDateTime -> ISO string
  updatedBy?: string;
  updationDate?: string; // LocalDateTime -> ISO string
  isActive?: boolean;
}
