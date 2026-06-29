export type ValidationStatus = "passed" | "failed" | "warning";

export interface ValidationIssue {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  context?: Record<string, unknown>;
}

export interface ProductStockValidationResult {
  productId: string;
  productName: string;
  expectedStock: number;
  actualStock: number;
  difference: number;
  status: ValidationStatus;
}

export interface StockValidationResult {
  status: ValidationStatus;
  summary: {
    totalProducts: number;
    passed: number;
    failed: number;
    totalMovements: number;
  };
  products: ProductStockValidationResult[];
  issues: ValidationIssue[];
}

export interface ReportValidationResult {
  status: ValidationStatus;
  summary: {
    checkedFields: number;
    passed: number;
    failed: number;
  };
  issues: ValidationIssue[];
}
