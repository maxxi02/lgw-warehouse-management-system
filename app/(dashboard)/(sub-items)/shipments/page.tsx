"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ShipmentPage() {
  const shipmentData = {
    trackingNumber: "SP-2024-001234",
    status: "Ready to Ship",
    orderDate: "March 15, 2024",
    estimatedDelivery: "March 20, 2024",
    shippingMethod: "Express Delivery",
    products: [
      {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        sku: "WBH-001",
        quantity: 2,
        price: 79.99,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 2,
        name: "USB-C Charging Cable",
        sku: "UCC-002",
        quantity: 3,
        price: 19.99,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 3,
        name: "Smartphone Case",
        sku: "SC-003",
        quantity: 1,
        price: 24.99,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },
    timeline: [
      { status: "Order Placed", date: "March 15, 2024", completed: true },
      { status: "Payment Confirmed", date: "March 15, 2024", completed: true },
      { status: "Items Packed", date: "March 16, 2024", completed: true },
      { status: "Ready to Ship", date: "March 17, 2024", completed: true },
      { status: "In Transit", date: "March 18, 2024", completed: false },
      { status: "Delivered", date: "March 20, 2024", completed: false },
    ],
  };

  const totalAmount = shipmentData.products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to orders</span>
            </Link>
          </Button>
          <div>
            <p className="text-muted-foreground">
              Track and manage your shipment
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Shipment Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shipment Overview
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {shipmentData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tracking Number
                    </p>
                    <p className="font-mono text-sm">
                      {shipmentData.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Order Date
                    </p>
                    <p className="text-sm">{shipmentData.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Shipping Method
                    </p>
                    <p className="text-sm">{shipmentData.shippingMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Est. Delivery
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {shipmentData.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products to Ship */}
            <Card>
              <CardHeader>
                <CardTitle>Products to Ship</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {shipmentData.products.length} items ready for shipment
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipmentData.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {product.sku}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(product.price * product.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipmentData.timeline.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {step.status}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {step.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {shipmentData.shippingAddress.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipmentData.shippingAddress.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipmentData.shippingAddress.city},{" "}
                    {shipmentData.shippingAddress.state}{" "}
                    {shipmentData.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipmentData.shippingAddress.country}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Truck className="h-4 w-4 mr-2" />
                  Mark as Shipped
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Package className="h-4 w-4 mr-2" />
                  Print Shipping Label
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Update Delivery Date
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>Estimated: {shipmentData.estimatedDelivery}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>{shipmentData.shippingMethod}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{shipmentData.products.length} items</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
