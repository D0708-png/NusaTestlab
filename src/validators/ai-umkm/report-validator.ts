import type {
  AiUmkmDataset,
  BusinessSummaryReport,
  InventorySummaryReport
} from "../../generators/ai-umkm/types.js";
import type { ReportValidationResult, ValidationIssue } from "./types.js";

export class ReportValidator {
  validate(dataset: AiUmkmDataset): ReportValidationResult {
    const issues: ValidationIssue[] = [];
    let checkedFields = 0;
    let passed = 0;
    let failed = 0;

    const computedInventory = computeInventorySummary(dataset);
    const computedBusiness = computeBusinessSummary(dataset);

    const check = (id: string, label: string, actual: unknown, expected: unknown): void => {
      checkedFields += 1;

      const actualText = JSON.stringify(actual);
      const expectedText = JSON.stringify(expected);

      if (actualText === expectedText) {
        passed += 1;
        return;
      }

      failed += 1;

      issues.push({
        id,
        severity: "high",
        message: `${label} does not match expected report value.`,
        context: {
          actual,
          expected
        }
      });
    };

    check(
      "inventory-total-products",
      "Inventory total products",
      dataset.expectedReports.inventorySummary.totalProducts,
      computedInventory.totalProducts
    );

    check(
      "inventory-total-stock-units",
      "Inventory total stock units",
      dataset.expectedReports.inventorySummary.totalStockUnits,
      computedInventory.totalStockUnits
    );

    check(
      "inventory-low-stock-count",
      "Inventory low stock count",
      dataset.expectedReports.inventorySummary.lowStockCount,
      computedInventory.lowStockCount
    );

    check(
      "inventory-low-stock-products",
      "Inventory low stock products",
      dataset.expectedReports.inventorySummary.lowStockProducts,
      computedInventory.lowStockProducts
    );

    check(
      "business-total-sales",
      "Business total sales",
      dataset.expectedReports.businessSummary.totalSales,
      computedBusiness.totalSales
    );

    check(
      "business-total-purchases",
      "Business total purchases",
      dataset.expectedReports.businessSummary.totalPurchases,
      computedBusiness.totalPurchases
    );

    check(
      "business-gross-profit",
      "Business gross profit",
      dataset.expectedReports.businessSummary.grossProfit,
      computedBusiness.grossProfit
    );

    check(
      "business-top-selling-products",
      "Business top selling products",
      dataset.expectedReports.businessSummary.topSellingProducts,
      computedBusiness.topSellingProducts
    );

    return {
      status: failed > 0 ? "failed" : "passed",
      summary: {
        checkedFields,
        passed,
        failed
      },
      issues
    };
  }
}

function computeInventorySummary(dataset: AiUmkmDataset): InventorySummaryReport {
  const lowStockProducts = dataset.products
    .filter((product) => product.currentStock <= product.minimumStock)
    .map((product) => product.id)
    .sort();

  return {
    totalProducts: dataset.products.length,
    totalStockUnits: dataset.products.reduce((total, product) => total + product.currentStock, 0),
    lowStockCount: lowStockProducts.length,
    lowStockProducts
  };
}

function computeBusinessSummary(dataset: AiUmkmDataset): BusinessSummaryReport {
  const soldQuantityByProduct = new Map<string, number>();
  let grossProfit = 0;

  for (const transaction of dataset.salesTransactions.filter((item) => item.status === "completed")) {
    const cogs = transaction.items.reduce(
      (total, item) => total + item.costPrice * item.quantity,
      0
    );

    grossProfit += transaction.grandTotal - cogs;

    for (const item of transaction.items) {
      soldQuantityByProduct.set(
        item.productId,
        (soldQuantityByProduct.get(item.productId) ?? 0) + item.quantity
      );
    }
  }

  return {
    totalSales: dataset.salesTransactions
      .filter((item) => item.status === "completed")
      .reduce((total, transaction) => total + transaction.grandTotal, 0),
    totalPurchases: dataset.purchaseTransactions
      .filter((item) => item.status === "completed")
      .reduce((total, transaction) => total + transaction.grandTotal, 0),
    grossProfit,
    topSellingProducts: Array.from(soldQuantityByProduct.entries())
      .map(([productId, quantity]) => ({ productId, quantity }))
      .sort((a, b) => b.quantity - a.quantity || a.productId.localeCompare(b.productId))
      .slice(0, 10)
  };
}
