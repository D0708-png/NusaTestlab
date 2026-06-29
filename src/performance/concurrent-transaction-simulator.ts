import type { AiUmkmDataset, Product, User } from "../generators/ai-umkm/types.js";
import type {
  SimulatedTransactionResult,
  TransactionSimulationOptions,
  TransactionSimulationResult
} from "./transaction-simulation-types.js";

class SeededRandom {
  constructor(private state: number) {}

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot choose from empty array.");
    }

    return items[this.int(0, items.length - 1)];
  }
}

export class ConcurrentTransactionSimulator {
  simulate(dataset: AiUmkmDataset, options: TransactionSimulationOptions): TransactionSimulationResult {
    const startedAtDate = new Date();
    const startedAt = Date.now();
    const random = new SeededRandom(options.seed);

    const products = dataset.products;
    const cashiers = dataset.users.filter((user) => user.role === "cashier");

    if (products.length === 0) {
      throw new Error("Dataset has no products.");
    }

    if (cashiers.length === 0) {
      throw new Error("Dataset has no cashier users.");
    }

    const initialStock = new Map<string, number>();
    const workingStock = new Map<string, number>();
    const soldQuantity = new Map<string, number>();

    for (const product of products) {
      initialStock.set(product.id, product.currentStock);
      workingStock.set(product.id, product.currentStock);
      soldQuantity.set(product.id, 0);
    }

    const transactions: SimulatedTransactionResult[] = [];
    let nextTransactionIndex = 0;

    const runWorker = (): void => {
      while (nextTransactionIndex < options.transactions) {
        nextTransactionIndex += 1;

        const transactionId = `sim_tx_${String(nextTransactionIndex).padStart(6, "0")}`;
        const result = this.simulateSingleTransaction(
          transactionId,
          products,
          cashiers,
          workingStock,
          soldQuantity,
          random,
          options.maxItemsPerTransaction
        );

        transactions.push(result);
      }
    };

    const workerCount = Math.min(options.concurrency, options.transactions);

    for (let index = 0; index < workerCount; index += 1) {
      runWorker();
    }

    const completedAtDate = new Date();
    const durationMs = Math.max(1, Date.now() - startedAt);
    const issues = [];

    let negativeStockProducts = 0;
    let stockMismatchProducts = 0;

    for (const product of products) {
      const currentStock = workingStock.get(product.id) ?? 0;
      const expectedStock = (initialStock.get(product.id) ?? 0) - (soldQuantity.get(product.id) ?? 0);

      if (currentStock < 0) {
        negativeStockProducts += 1;

        issues.push({
          id: "negative-stock-after-simulation",
          severity: "critical" as const,
          message: "Product stock became negative after concurrent transaction simulation.",
          context: {
            productId: product.id,
            productName: product.name,
            currentStock
          }
        });
      }

      if (currentStock !== expectedStock) {
        stockMismatchProducts += 1;

        issues.push({
          id: "stock-mismatch-after-simulation",
          severity: "critical" as const,
          message: "Product stock does not match expected simulated stock.",
          context: {
            productId: product.id,
            productName: product.name,
            currentStock,
            expectedStock
          }
        });
      }
    }

    const completedTransactions = transactions.filter((transaction) => transaction.status === "completed");
    const rejectedTransactions = transactions.filter((transaction) => transaction.status === "rejected");
    const totalItemsSold = completedTransactions.reduce(
      (total, transaction) => total + transaction.totalQuantity,
      0
    );
    const totalSalesAmount = completedTransactions.reduce(
      (total, transaction) => total + transaction.totalAmount,
      0
    );

    return {
      status: issues.some((issue) => issue.severity === "critical" || issue.severity === "high")
        ? "failed"
        : "passed",
      dataset: {
        seed: dataset.metadata.seed,
        productCount: dataset.products.length,
        cashierCount: cashiers.length
      },
      options,
      summary: {
        totalTransactions: transactions.length,
        completedTransactions: completedTransactions.length,
        rejectedTransactions: rejectedTransactions.length,
        totalItemsSold,
        totalSalesAmount,
        negativeStockProducts,
        stockMismatchProducts,
        durationMs,
        throughputPerSecond: Number((transactions.length / (durationMs / 1000)).toFixed(2))
      },
      transactions,
      issues,
      startedAt: startedAtDate.toISOString(),
      completedAt: completedAtDate.toISOString()
    };
  }

  private simulateSingleTransaction(
    transactionId: string,
    products: Product[],
    cashiers: User[],
    workingStock: Map<string, number>,
    soldQuantity: Map<string, number>,
    random: SeededRandom,
    maxItemsPerTransaction: number
  ): SimulatedTransactionResult {
    const cashier = random.choice(cashiers);
    const itemCount = random.int(1, Math.max(1, maxItemsPerTransaction));
    const selectedProducts = new Map<string, Product>();

    for (let index = 0; index < itemCount; index += 1) {
      const product = random.choice(products);
      selectedProducts.set(product.id, product);
    }

    let totalQuantity = 0;
    let totalAmount = 0;

    const requestedItems = Array.from(selectedProducts.values()).map((product) => {
      const availableStock = workingStock.get(product.id) ?? 0;
      const quantity = random.int(1, Math.min(3, Math.max(1, availableStock)));

      return {
        product,
        quantity
      };
    });

    const insufficientItem = requestedItems.find(
      (item) => (workingStock.get(item.product.id) ?? 0) < item.quantity
    );

    if (insufficientItem) {
      return {
        id: transactionId,
        cashierId: cashier.id,
        status: "rejected",
        itemCount: requestedItems.length,
        totalQuantity: 0,
        totalAmount: 0,
        rejectionReason: `Insufficient stock for product ${insufficientItem.product.id}.`
      };
    }

    for (const item of requestedItems) {
      const currentStock = workingStock.get(item.product.id) ?? 0;
      workingStock.set(item.product.id, currentStock - item.quantity);
      soldQuantity.set(
        item.product.id,
        (soldQuantity.get(item.product.id) ?? 0) + item.quantity
      );

      totalQuantity += item.quantity;
      totalAmount += item.quantity * item.product.sellingPrice;
    }

    return {
      id: transactionId,
      cashierId: cashier.id,
      status: "completed",
      itemCount: requestedItems.length,
      totalQuantity,
      totalAmount
    };
  }
}
