"use client";

import {
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for most sold products
const mostSoldData = [
  { product: "Wireless Headphones", sales: 1250, fill: "hsl(var(--chart-1))" },
  { product: "Smartphone Case", sales: 980, fill: "hsl(var(--chart-2))" },
  { product: "Bluetooth Speaker", sales: 750, fill: "hsl(var(--chart-3))" },
  { product: "USB Cable", sales: 620, fill: "hsl(var(--chart-4))" },
  { product: "Power Bank", sales: 450, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  sales: {
    label: "Sales",
  },
  "Wireless Headphones": {
    label: "Wireless Headphones",
    color: "hsl(var(--chart-1))",
  },
  "Smartphone Case": {
    label: "Smartphone Case",
    color: "hsl(var(--chart-2))",
  },
  "Bluetooth Speaker": {
    label: "Bluetooth Speaker",
    color: "hsl(var(--chart-3))",
  },
  "USB Cable": {
    label: "USB Cable",
    color: "hsl(var(--chart-4))",
  },
  "Power Bank": {
    label: "Power Bank",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

// Mock data for recent products
const recentProducts = [
  {
    id: 1,
    name: "Gaming Mouse",
    category: "Electronics",
    price: 79.99,
    stock: 45,
    status: "in-stock",
    dateAdded: "2024-01-15",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: 129.99,
    stock: 0,
    status: "out-of-stock",
    dateAdded: "2024-01-14",
  },
  {
    id: 3,
    name: "Desk Lamp",
    category: "Furniture",
    price: 34.99,
    stock: 23,
    status: "in-stock",
    dateAdded: "2024-01-13",
  },
  {
    id: 4,
    name: "Coffee Mug",
    category: "Kitchen",
    price: 12.99,
    stock: 5,
    status: "low-stock",
    dateAdded: "2024-01-12",
  },
  {
    id: 5,
    name: "Notebook Set",
    category: "Stationery",
    price: 19.99,
    stock: 67,
    status: "in-stock",
    dateAdded: "2024-01-11",
  },
];

export const ProductsTab = () => {
  const totalSales = mostSoldData.reduce((sum, item) => sum + item.sales, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">-5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Store Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Most Sold Products Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Most Sold Products</CardTitle>
            <CardDescription>Top 5 products by sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={mostSoldData}
                  dataKey="sales"
                  nameKey="product"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {mostSoldData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="product" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing sales data for the last 30 days
            </div>
          </CardFooter>
        </Card>

        {/* Recent Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Products</CardTitle>
            <CardDescription>
              Latest products added to inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "in-stock"
                            ? "default"
                            : product.status === "out-of-stock"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {product.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
