export interface TransactionSimulationOptions {
  transactions: number;
  concurrency: number;
  maxItemsPerTransaction: number;
  seed: number;
}

export interface SimulatedTransactionResult {
  id: string;
  cashierId: string;
  status: "completed" | "rejected";
  itemCount: number;
  totalQuantity: number;
  totalAmount: number;
  rejectionReason?: string;
}

export interface TransactionSimulationSummary {
  totalTransactions: number;
  completedTransactions: number;
  rejectedTransactions: number;
  totalItemsSold: number;
  totalSalesAmount: number;
  negativeStockProducts: number;
  stockMismatchProducts: number;
  durationMs: number;
  throughputPerSecond: number;
}

export interface TransactionSimulationResult {
  status: "passed" | "failed";
  dataset: {
    seed: number;
    productCount: number;
    cashierCount: number;
  };
  options: TransactionSimulationOptions;
  summary: TransactionSimulationSummary;
  transactions: SimulatedTransactionResult[];
  issues: Array<{
    id: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    context?: Record<string, unknown>;
  }>;
  startedAt: string;
  completedAt: string;
}
