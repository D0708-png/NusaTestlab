export type UserRole = "owner" | "admin" | "cashier";

export type StockMovementType =
  | "initial"
  | "purchase"
  | "sale"
  | "return"
  | "damaged"
  | "adjustment";

export interface Tenant {
  id: string;
  name: string;
  status: "active" | "inactive";
}

export interface Store {
  id: string;
  tenantId: string;
  name: string;
  status: "active" | "inactive";
}

export interface User {
  id: string;
  tenantId: string;
  storeId: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  status: "active" | "inactive";
}

export interface Product {
  id: string;
  tenantId: string;
  storeId: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  supplierId: string;
  costPrice: number;
  sellingPrice: number;
  initialStock: number;
  currentStock: number;
  minimumStock: number;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  storeId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

export interface SalesTransactionItem {
  productId: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  subtotal: number;
}

export interface SalesTransaction {
  id: string;
  tenantId: string;
  storeId: string;
  cashierId: string;
  items: SalesTransactionItem[];
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  status: "completed" | "cancelled";
  createdAt: string;
}

export interface PurchaseTransactionItem {
  productId: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseTransaction {
  id: string;
  tenantId: string;
  storeId: string;
  supplierId: string;
  items: PurchaseTransactionItem[];
  grandTotal: number;
  status: "completed" | "cancelled";
  createdAt: string;
}

export interface InventorySummaryReport {
  totalProducts: number;
  totalStockUnits: number;
  lowStockCount: number;
  lowStockProducts: string[];
}

export interface BusinessSummaryReport {
  totalSales: number;
  totalPurchases: number;
  grossProfit: number;
  topSellingProducts: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface AiUmkmExpectedReports {
  inventorySummary: InventorySummaryReport;
  businessSummary: BusinessSummaryReport;
}

export interface AiUmkmDataset {
  metadata: {
    profile: "ai-umkm";
    version: string;
    seed: number;
    generatedAt: string;
  };
  tenants: Tenant[];
  stores: Store[];
  users: User[];
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  stockMovements: StockMovement[];
  salesTransactions: SalesTransaction[];
  purchaseTransactions: PurchaseTransaction[];
  expectedReports: AiUmkmExpectedReports;
}
