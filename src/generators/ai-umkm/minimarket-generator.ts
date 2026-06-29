import type {
  AiUmkmDataset,
  AiUmkmExpectedReports,
  BusinessSummaryReport,
  Category,
  InventorySummaryReport,
  Product,
  PurchaseTransaction,
  SalesTransaction,
  StockMovement,
  Supplier,
  Tenant,
  User
} from "./types.js";

interface GeneratorOptions {
  productCount: number;
  supplierCount: number;
  purchaseCount: number;
  salesCount: number;
  seed: number;
}

class SeededRandom {
  constructor(private state: number) {}

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  choice<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot choose from empty array.");
    }

    return items[this.int(0, items.length - 1)];
  }
}

const CATEGORY_NAMES = [
  "Makanan Instan",
  "Minuman",
  "Sembako",
  "Snack",
  "Perawatan Diri",
  "Perlengkapan Rumah",
  "Produk Bayi",
  "Obat Ringan"
];

const PRODUCT_NAMES = [
  "Beras Ramos 5kg",
  "Minyak Goreng 1L",
  "Gula Pasir 1kg",
  "Indomie Goreng",
  "Aqua 600ml",
  "Teh Botol 350ml",
  "Kopi Sachet",
  "Susu UHT 1L",
  "Sabun Mandi",
  "Shampoo Sachet",
  "Detergen Bubuk",
  "Tisu Wajah",
  "Biskuit Coklat",
  "Keripik Kentang",
  "Saus Sambal",
  "Kecap Manis"
];

export class MinimarketDataGenerator {
  generate(options: GeneratorOptions): AiUmkmDataset {
    const random = new SeededRandom(options.seed);
    const generatedAt = new Date().toISOString();

    const tenant: Tenant = {
      id: "tenant_0001",
      name: "Toko Sumber Rezeki",
      status: "active"
    };

    const store = {
      id: "store_0001",
      tenantId: tenant.id,
      name: "Toko Sumber Rezeki - Cabang Utama",
      status: "active" as const
    };

    const users: User[] = [
      {
        id: "user_owner_0001",
        tenantId: tenant.id,
        storeId: store.id,
        name: "Owner Test",
        email: "owner@test.local",
        role: "owner",
        status: "active"
      },
      {
        id: "user_admin_0001",
        tenantId: tenant.id,
        storeId: store.id,
        name: "Admin Test",
        email: "admin@test.local",
        role: "admin",
        status: "active"
      },
      {
        id: "user_cashier_0001",
        tenantId: tenant.id,
        storeId: store.id,
        name: "Cashier Test 1",
        email: "cashier1@test.local",
        role: "cashier",
        status: "active"
      },
      {
        id: "user_cashier_0002",
        tenantId: tenant.id,
        storeId: store.id,
        name: "Cashier Test 2",
        email: "cashier2@test.local",
        role: "cashier",
        status: "active"
      }
    ];

    const categories: Category[] = CATEGORY_NAMES.map((name, index) => ({
      id: formatId("cat", index + 1),
      tenantId: tenant.id,
      name
    }));

    const suppliers: Supplier[] = Array.from({ length: options.supplierCount }, (_, index) => ({
      id: formatId("supplier", index + 1),
      tenantId: tenant.id,
      name: `Supplier Test ${index + 1}`,
      status: "active"
    }));

    const products: Product[] = [];
    const stockByProduct = new Map<string, number>();
    const stockMovements: StockMovement[] = [];

    for (let index = 0; index < options.productCount; index += 1) {
      const category = random.choice(categories);
      const supplier = random.choice(suppliers);
      const baseName = PRODUCT_NAMES[index % PRODUCT_NAMES.length];
      const costPrice = random.int(2500, 75000);
      const sellingPrice = Math.round(costPrice * (1.15 + random.next() * 0.35));
      const initialStock = random.int(40, 250);

      const product: Product = {
        id: formatId("product", index + 1),
        tenantId: tenant.id,
        storeId: store.id,
        sku: `SKU-${String(index + 1).padStart(6, "0")}`,
        barcode: `899${String(100000000 + index).padStart(9, "0")}`,
        name: `${baseName} ${index + 1}`,
        categoryId: category.id,
        supplierId: supplier.id,
        costPrice,
        sellingPrice,
        initialStock,
        currentStock: initialStock,
        minimumStock: random.int(10, 35)
      };

      products.push(product);
      stockByProduct.set(product.id, initialStock);

      stockMovements.push({
        id: formatId("movement_initial", index + 1),
        tenantId: tenant.id,
        storeId: store.id,
        productId: product.id,
        type: "initial",
        quantity: initialStock,
        referenceType: "initial_stock",
        referenceId: product.id,
        createdAt: createDate(index)
      });
    }

    const purchaseTransactions: PurchaseTransaction[] = [];

    for (let index = 0; index < options.purchaseCount; index += 1) {
      const product = random.choice(products);
      const supplier = suppliers.find((item) => item.id === product.supplierId) ?? random.choice(suppliers);
      const quantity = random.int(5, 80);
      const subtotal = quantity * product.costPrice;
      const purchaseId = formatId("purchase", index + 1);

      purchaseTransactions.push({
        id: purchaseId,
        tenantId: tenant.id,
        storeId: store.id,
        supplierId: supplier.id,
        items: [
          {
            productId: product.id,
            quantity,
            unitCost: product.costPrice,
            subtotal
          }
        ],
        grandTotal: subtotal,
        status: "completed",
        createdAt: createDate(1000 + index)
      });

      stockByProduct.set(product.id, (stockByProduct.get(product.id) ?? 0) + quantity);

      stockMovements.push({
        id: formatId("movement_purchase", index + 1),
        tenantId: tenant.id,
        storeId: store.id,
        productId: product.id,
        type: "purchase",
        quantity,
        referenceType: "purchase_transaction",
        referenceId: purchaseId,
        createdAt: createDate(1000 + index)
      });
    }

    const cashiers = users.filter((user) => user.role === "cashier");
    const salesTransactions: SalesTransaction[] = [];

    for (let index = 0; index < options.salesCount; index += 1) {
      const availableProducts = products.filter((product) => (stockByProduct.get(product.id) ?? 0) > 0);

      if (availableProducts.length === 0) {
        break;
      }

      const product = random.choice(availableProducts);
      const currentStock = stockByProduct.get(product.id) ?? 0;
      const quantity = random.int(1, Math.min(5, currentStock));
      const subtotal = quantity * product.sellingPrice;
      const discountTotal = random.chance(0.1) ? Math.round(subtotal * 0.05) : 0;
      const grandTotal = subtotal - discountTotal;
      const saleId = formatId("sale", index + 1);

      salesTransactions.push({
        id: saleId,
        tenantId: tenant.id,
        storeId: store.id,
        cashierId: random.choice(cashiers).id,
        items: [
          {
            productId: product.id,
            quantity,
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
            subtotal
          }
        ],
        subtotal,
        discountTotal,
        grandTotal,
        status: "completed",
        createdAt: createDate(2000 + index)
      });

      stockByProduct.set(product.id, currentStock - quantity);

      stockMovements.push({
        id: formatId("movement_sale", index + 1),
        tenantId: tenant.id,
        storeId: store.id,
        productId: product.id,
        type: "sale",
        quantity,
        referenceType: "sales_transaction",
        referenceId: saleId,
        createdAt: createDate(2000 + index)
      });
    }

    const damagedCount = Math.min(Math.floor(options.productCount * 0.05), 30);

    for (let index = 0; index < damagedCount; index += 1) {
      const availableProducts = products.filter((product) => (stockByProduct.get(product.id) ?? 0) > 0);

      if (availableProducts.length === 0) {
        break;
      }

      const product = random.choice(availableProducts);
      const currentStock = stockByProduct.get(product.id) ?? 0;
      const quantity = random.int(1, Math.min(3, currentStock));

      stockByProduct.set(product.id, currentStock - quantity);

      stockMovements.push({
        id: formatId("movement_damaged", index + 1),
        tenantId: tenant.id,
        storeId: store.id,
        productId: product.id,
        type: "damaged",
        quantity,
        referenceType: "damaged_stock",
        referenceId: formatId("damaged", index + 1),
        createdAt: createDate(3000 + index)
      });
    }

    const adjustmentCount = Math.min(Math.floor(options.productCount * 0.03), 20);

    for (let index = 0; index < adjustmentCount; index += 1) {
      const product = random.choice(products);
      const currentStock = stockByProduct.get(product.id) ?? 0;
      let quantity = random.int(-2, 3);

      if (quantity === 0) {
        quantity = 1;
      }

      if (currentStock + quantity < 0) {
        quantity = 1;
      }

      stockByProduct.set(product.id, currentStock + quantity);

      stockMovements.push({
        id: formatId("movement_adjustment", index + 1),
        tenantId: tenant.id,
        storeId: store.id,
        productId: product.id,
        type: "adjustment",
        quantity,
        referenceType: "stock_opname",
        referenceId: formatId("opname", index + 1),
        createdAt: createDate(4000 + index)
      });
    }

    for (const product of products) {
      product.currentStock = stockByProduct.get(product.id) ?? product.currentStock;
    }

    const expectedReports = buildExpectedReports(products, salesTransactions, purchaseTransactions);

    return {
      metadata: {
        profile: "ai-umkm",
        version: "0.1.0",
        seed: options.seed,
        generatedAt
      },
      tenants: [tenant],
      stores: [store],
      users,
      categories,
      suppliers,
      products,
      stockMovements,
      salesTransactions,
      purchaseTransactions,
      expectedReports
    };
  }
}

function buildExpectedReports(
  products: Product[],
  salesTransactions: SalesTransaction[],
  purchaseTransactions: PurchaseTransaction[]
): AiUmkmExpectedReports {
  const lowStockProducts = products
    .filter((product) => product.currentStock <= product.minimumStock)
    .map((product) => product.id)
    .sort();

  const inventorySummary: InventorySummaryReport = {
    totalProducts: products.length,
    totalStockUnits: products.reduce((total, product) => total + product.currentStock, 0),
    lowStockCount: lowStockProducts.length,
    lowStockProducts
  };

  const soldQuantityByProduct = new Map<string, number>();
  let grossProfit = 0;

  for (const transaction of salesTransactions.filter((item) => item.status === "completed")) {
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

  const topSellingProducts = Array.from(soldQuantityByProduct.entries())
    .map(([productId, quantity]) => ({ productId, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.productId.localeCompare(b.productId))
    .slice(0, 10);

  const businessSummary: BusinessSummaryReport = {
    totalSales: salesTransactions
      .filter((item) => item.status === "completed")
      .reduce((total, transaction) => total + transaction.grandTotal, 0),
    totalPurchases: purchaseTransactions
      .filter((item) => item.status === "completed")
      .reduce((total, transaction) => total + transaction.grandTotal, 0),
    grossProfit,
    topSellingProducts
  };

  return {
    inventorySummary,
    businessSummary
  };
}

function formatId(prefix: string, index: number): string {
  return `${prefix}_${String(index).padStart(6, "0")}`;
}

function createDate(offsetMinutes: number): string {
  const base = Date.UTC(2026, 0, 1, 0, 0, 0);
  return new Date(base + offsetMinutes * 60 * 1000).toISOString();
}
