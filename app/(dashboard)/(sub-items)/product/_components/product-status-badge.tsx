import { Badge } from "@/components/ui/badge";

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status?: "active" | "inactive" | "out-of-stock";
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
  updatedBy?: {
    name: string;
    email: string;
  };
}

interface ProductStatusBadgeProps {
  product: Product;
}

export const ProductStatusBadge = ({ product }: ProductStatusBadgeProps) => {
  const getProductStatus = (product: Product) => {
    if (product.status) {
      return product.status;
    }
    // Fallback to stock-based status
    return product.stock === 0 ? "out-of-stock" : "active";
  };

  const status = getProductStatus(product);

  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "inactive":
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    case "out-of-stock":
      return <Badge variant="destructive">Out of Stock</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
