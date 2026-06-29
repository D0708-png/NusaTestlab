import type { AiUmkmDataset, StockMovementType } from "../../generators/ai-umkm/types.js";
import type {
  ProductStockValidationResult,
  StockValidationResult,
  ValidationIssue
} from "./types.js";

interface StockBreakdown {
  initial: number;
  purchase: number;
  sale: number;
  return: number;
  damaged: number;
  adjustment: number;
}

export class StockValidator {
  validate(dataset: AiUmkmDataset): StockValidationResult {
    const issues: ValidationIssue[] = [];
    const products: ProductStockValidationResult[] = [];
    const movementsByProduct = new Map<string, StockBreakdown>();

    for (const product of dataset.products) {
      movementsByProduct.set(product.id, {
        initial: 0,
        purchase: 0,
        sale: 0,
        return: 0,
        damaged: 0,
        adjustment: 0
      });
    }

    for (const movement of dataset.stockMovements) {
      const breakdown = movementsByProduct.get(movement.productId);

      if (!breakdown) {
        issues.push({
          id: "stock-movement-product-not-found",
          severity: "high",
          message: "Stock movement references unknown product.",
          context: {
            movementId: movement.id,
            productId: movement.productId
          }
        });

        continue;
      }

      breakdown[movement.type as StockMovementType] += movement.quantity;
    }

    for (const product of dataset.products) {
      const breakdown = movementsByProduct.get(product.id);

      if (!breakdown) {
        continue;
      }

      const expectedStock =
        breakdown.initial +
        breakdown.purchase -
        breakdown.sale +
        breakdown.return -
        breakdown.damaged +
        breakdown.adjustment;

      const difference = product.currentStock - expectedStock;
      const status = difference === 0 && expectedStock >= 0 ? "passed" : "failed";

      if (expectedStock < 0) {
        issues.push({
          id: "stock-negative-result",
          severity: "critical",
          message: "Calculated stock is negative.",
          context: {
            productId: product.id,
            productName: product.name,
            expectedStock
          }
        });
      }

      if (difference !== 0) {
        issues.push({
          id: "stock-mismatch",
          severity: "critical",
          message: "Product current stock does not match calculated stock.",
          context: {
            productId: product.id,
            productName: product.name,
            expectedStock,
            actualStock: product.currentStock,
            difference
          }
        });
      }

      products.push({
        productId: product.id,
        productName: product.name,
        expectedStock,
        actualStock: product.currentStock,
        difference,
        status
      });
    }

    const failed = products.filter((product) => product.status === "failed").length;
    const passed = products.length - failed;

    return {
      status: issues.some((issue) => issue.severity === "critical" || issue.severity === "high")
        ? "failed"
        : "passed",
      summary: {
        totalProducts: products.length,
        passed,
        failed,
        totalMovements: dataset.stockMovements.length
      },
      products,
      issues
    };
  }
}
