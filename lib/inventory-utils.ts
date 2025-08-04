import { Product } from "@/types/product-types";
const LOW_STOCK_THRESHOLD = 10;
export function filterProducts(
  products: Product[],
  searchTerm: string
): Product[] {
  if (!searchTerm) return products;

  const term = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
  );
}

export function calculateInventoryStats(products: Product[]) {
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );
  const lowStockProducts = products.filter(
    (product) => product.stock < LOW_STOCK_THRESHOLD
  ).length;
  const activeProducts = products.filter(
    (product) => product.status === "active"
  ).length;

  return {
    totalProducts,
    totalValue,
    lowStockProducts,
    activeProducts,
  };
}

export function getStockStatus(
  quantity: number
): "out-of-stock" | "low-stock" | "in-stock" {
  if (quantity === 0) return "out-of-stock";
  if (quantity < LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}
