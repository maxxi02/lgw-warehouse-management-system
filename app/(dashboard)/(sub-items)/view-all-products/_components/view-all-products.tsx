"use client";

import { useState, useEffect, useRef } from "react";
import { Package, MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/types/product-types";
import { getServerSession } from "@/lib/actions";
import { Session } from "@/lib/auth-types";
import { batangasCityBarangays } from "./batangas-location";
import { NotificationHelper } from "@/lib/notification-utils";
import Image from "next/image";

interface DeliveryPersonnel {
  id: string;
  name: string;
  email: string;
  role: string;
  fcmToken?: string;
}

interface ShipmentData {
  quantity: string;
  destination: string;
  note: string;
  driverId: string;
  estimatedDelivery?: string;
}

interface EditProductData {
  name: string;
  price: string;
  stock: string;
  category: string;
  description?: string;
}

export default function ProductManagement() {
  const sseConnectionRef = useRef<EventSource | null>(null);
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<
    DeliveryPersonnel[]
  >([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [filteredAddresses, setFilteredAddresses] = useState<
    typeof batangasCityBarangays
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [shipmentData, setShipmentData] = useState<ShipmentData>({
    quantity: "",
    destination: "",
    note: "",
    driverId: "",
  });

  const [sellData, setSellData] = useState({
    quantity: "",
    note: "",
  });

  const [editProductData, setEditProductData] = useState<EditProductData>({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersonnel = async () => {
    try {
      const response = await authClient.admin.listUsers({
        query: { limit: 100 },
      });

      if (response.data?.users) {
        const deliveryUsers = await Promise.all(
          response.data.users
            .filter((user) => user.role?.toLowerCase() === "delivery")
            .map(async (user) => {
              try {
                const driverResponse = await fetch(`/api/drivers/${user.id}`);
                const driverData = await driverResponse.json();
                return {
                  id: user.id,
                  name: user.name || "",
                  email: user.email,
                  role: user.role || "delivery",
                  fcmToken: driverData.success
                    ? driverData.driver?.fcmToken || ""
                    : "",
                };
              } catch (error) {
                console.error(
                  `Error fetching driver info for ${user.id}:`,
                  error
                );
                return {
                  id: user.id,
                  name: user.name || "",
                  email: user.email,
                  role: user.role || "delivery",
                  fcmToken: "",
                };
              }
            })
        );
        setDeliveryPersonnel(deliveryUsers);
      }
    } catch (error) {
      console.error("Failed to fetch delivery personnel:", error);
      toast.error("Failed to fetch delivery personnel");
    }
  };

  const handleAddressChange = (value: string) => {
    setAddressInput(value);
    setShipmentData({ ...shipmentData, destination: value });

    if (value.length > 1) {
      const filtered = batangasCityBarangays.filter(
        (addr) =>
          addr.city.toLowerCase().includes(value.toLowerCase()) ||
          addr.fullAddress.toLowerCase().includes(value.toLowerCase()) ||
          addr.barangay.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAddresses(filtered.slice(0, 5));
      setShowDropdown(true);
    } else {
      setFilteredAddresses([]);
      setShowDropdown(false);
    }
  };

  const handleSell = (product: Product) => {
    setSelectedProduct(product);
    setSellData({ quantity: "", note: "" });
    setShowSellModal(true);
  };

  const confirmSell = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(
        `/api/products/${selectedProduct._id}/sold`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantityToDeduct: parseInt(sellData.quantity),
            notes:
              sellData.note ||
              `Sold via Product Management - ${selectedProduct.name}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process sale");
      }

      toast.success("Sale Processed", {
        description: `${sellData.quantity} units of ${selectedProduct.name} sold successfully.`,
      });

      setShowSellModal(false);
      await fetchProducts();
    } catch (error) {
      console.error("Error processing sale:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process sale"
      );
    }
  };

  const handleShip = (product: Product) => {
    setSelectedProduct(product);
    setShipmentData({
      quantity: "",
      destination: "",
      note: "",
      driverId: "",
    });
    setShowShipModal(true);
  };

  const confirmShipment = async () => {
    if (!selectedProduct) return;
    NotificationHelper.registerUserInteraction();
    try {
      const driver = deliveryPersonnel.find(
        (d) => d.id === shipmentData.driverId
      );
      if (!driver) {
        toast.error("Please select a delivery person");
        return;
      }

      const currentUser = await getServerSession();
      if (!currentUser?.user) {
        toast.error("User session not found");
        return;
      }

      // First create the shipment record
      const response = await fetch(
        `/api/products/${selectedProduct._id}/to-ship`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: parseInt(shipmentData.quantity),
            deliveryPersonnel: {
              id: driver.id,
              fullName: driver.name,
              email: driver.email,
              fcmToken: driver.fcmToken,
            },
            destination: shipmentData.destination,
            note: shipmentData.note,
            estimatedDelivery: shipmentData.estimatedDelivery,
            markedBy: {
              name: currentUser.user.name || "Admin",
              email: currentUser.user.email || "admin@example.com",
              role: currentUser.user.role || "admin",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark as to ship");
      }

      const result = await response.json();

      // Then send the notification with the data structure that matches the schema
      try {
        const notificationResponse = await fetch(
          "/api/notifications/newShipment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              driverEmail: driver.email,
              shipmentData: {
                // Use the correct field name based on your API response
                id: result.shipmentId || result.id || result._id, // Handle different possible response formats
                product: {
                  id: selectedProduct._id,
                  name: selectedProduct.name,
                  sku: selectedProduct.sku,
                  image: selectedProduct.image || "",
                  quantity: parseInt(shipmentData.quantity),
                },
                customerAddress: {
                  destination: shipmentData.destination,
                  coordinates: batangasCityBarangays.find(
                    (addr) => addr.fullAddress === shipmentData.destination
                  )?.coordinates,
                },
                deliveryPersonnel: {
                  id: driver.id,
                  fullName: driver.name,
                  email: driver.email,
                  fcmToken: driver.fcmToken || "",
                },
                status: "pending",
                note: shipmentData.note || "",
                assignedDate: new Date().toISOString(),
                estimatedDelivery: shipmentData.estimatedDelivery || null,
                markedBy: {
                  name: currentUser.user.name || "Admin",
                  email: currentUser.user.email || "admin@example.com",
                  role: currentUser.user.role || "admin",
                },
              },
            }),
          }
        );
        NotificationHelper.triggerNotification({
          sound: true,
          respectAudioSettings: true,
          type: "assignment",
          vibration: true,
        });
        if (!notificationResponse.ok) {
          const errorData = await notificationResponse.json();
          console.error("Notification error details:", errorData);
          throw new Error(errorData.error || "Failed to send notification");
        }
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Don't fail the whole operation if notification fails
        toast.warning("Shipment created but notification failed");
      }

      NotificationHelper.triggerNotification({
        sound: true,
        vibration: true,
        respectAudioSettings: true,
        type: "assignment",
      });

      toast.success("Shipment Confirmed", {
        description: `${shipmentData.quantity} units of ${selectedProduct?.name} assigned to ${driver?.name} for delivery.`,
      });

      setShowShipModal(false);
      await fetchProducts();
    } catch (error) {
      console.error("Error confirming shipment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm shipment"
      );
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditProductData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      description: product.description || "",
    });
    setShowEditModal(true);
  };

  const confirmEdit = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editProductData,
          price: parseFloat(editProductData.price) || 0,
          stock: parseInt(editProductData.stock) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      toast.success("Product Updated", {
        description: `${selectedProduct?.name} has been updated successfully.`,
      });

      setShowEditModal(false);
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update product"
      );
    }
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      toast.success("Product Deleted", {
        description: `${selectedProduct?.name} has been deleted successfully.`,
      });

      setShowDeleteModal(false);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product"
      );
    }
  };

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < 10) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          In Stock
        </Badge>
      );
    }
  };

  const setupSSEConnection = (userId: string, userEmail: string) => {
    if (sseConnectionRef.current) {
      sseConnectionRef.current.close();
    }

    const connection = new EventSource(
      `/api/sse?userId=${userId}&userEmail=${encodeURIComponent(userEmail)}`
    );
    sseConnectionRef.current = connection;

    connection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "DELIVERY_STATUS_UPDATE":
            NotificationHelper.triggerNotification({
              sound: true,
              vibration: false,
              respectAudioSettings: true,
              type: "status",
            });
            toast.info("Delivery Status Updated", {
              description: `Delivery #${data.data.assignmentId.slice(-6)} is now ${data.data.newStatus.toUpperCase()}`,
            });
            break;
          case "SHIPMENT_DELIVERED":
            NotificationHelper.triggerNotification({
              sound: true,
              vibration: true,
              respectAudioSettings: true,
              type: "completion",
            });
            toast.success("Delivery Completed! 🎉", {
              description: `${data.data.productName} has been successfully delivered`,
            });
            fetchProducts();
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    connection.onerror = () => {
      setTimeout(() => {
        if (userSession) {
          setupSSEConnection(userId, userEmail);
        }
      }, 5000);
    };
  };
  // useEffect(() => {
  //   const handleUserInteraction = () => {
  //     NotificationHelper.registerUserInteraction();
  //   };

  //   // Register interaction on any click, touch, or keydown
  //   document.addEventListener("click", handleUserInteraction, { once: true });
  //   document.addEventListener("touchstart", handleUserInteraction, {
  //     once: true,
  //   });
  //   document.addEventListener("keydown", handleUserInteraction, { once: true });

  //   return () => {
  //     document.removeEventListener("click", handleUserInteraction);
  //     document.removeEventListener("touchstart", handleUserInteraction);
  //     document.removeEventListener("keydown", handleUserInteraction);
  //   };
  // }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getServerSession();
      if (session?.user?.email) {
        setUserSession(session);
        setupSSEConnection(session.user.id, session.user.email);
        await NotificationHelper.initialize();
        NotificationHelper.registerUserInteraction();
      } else {
        setLoading(false);
        toast.error("Please log in to view your deliveries");
      }
    };
    fetchSession();

    return () => {
      if (sseConnectionRef.current) {
        sseConnectionRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchDeliveryPersonnel();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Product Management
          </h1>
          <p className="text-muted-foreground mt-2">Loading products...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Product Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your inventory, process sales, and handle shipments
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No products found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm
                ? "Try a different search term"
                : "No products available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative bg-gray-100">
                <Image
                  width={500}
                  height={500}
                  src={product.image || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-product.jpg";
                  }}
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.status!, product.stock)}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description ||
                      `High-quality ${product.category.toLowerCase()} product`}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Stock:{" "}
                      <span className="font-medium">{product.stock}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSell(product)}
                    disabled={product.stock === 0}
                    className="w-full rounded-md"
                  >
                    🛒 Sell
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShip(product)}
                    disabled={product.stock === 0}
                    className="w-full rounded-md"
                  >
                    📦 Ship
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <span className="mr-2">✏️</span> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(product)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <span className="mr-2">🗑️</span> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sell Product Modal */}
      <Dialog open={showSellModal} onOpenChange={setShowSellModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              Sell Product
            </DialogTitle>
            <DialogDescription>
              Process sale for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sell-quantity">Quantity to Sell</Label>
              <Input
                id="sell-quantity"
                type="number"
                placeholder="Enter quantity"
                value={sellData.quantity}
                onChange={(e) =>
                  setSellData({ ...sellData, quantity: e.target.value })
                }
                max={selectedProduct?.stock}
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                Available stock: {selectedProduct?.stock}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sell-note">Sale Note (Optional)</Label>
              <Textarea
                id="sell-note"
                placeholder="Additional notes about this sale"
                value={sellData.note}
                onChange={(e) =>
                  setSellData({ ...sellData, note: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmSell}
              disabled={
                !sellData.quantity ||
                parseInt(sellData.quantity) <= 0 ||
                parseInt(sellData.quantity) > (selectedProduct?.stock || 0)
              }
            >
              Process Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ship Product Modal */}
      <Dialog open={showShipModal} onOpenChange={setShowShipModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              Ship Product
            </DialogTitle>
            <DialogDescription>
              Configure shipment details for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity to Ship</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={shipmentData.quantity}
                onChange={(e) =>
                  setShipmentData({ ...shipmentData, quantity: e.target.value })
                }
                max={selectedProduct?.stock}
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                Available stock: {selectedProduct?.stock}
              </p>
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="destination">Destination Address</Label>
              <div className="relative">
                <Input
                  id="destination"
                  placeholder="Start typing city or street..."
                  value={addressInput}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() =>
                    addressInput.length > 1 && setShowDropdown(true)
                  }
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                {showDropdown && filteredAddresses.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredAddresses.map((address) => (
                      <li
                        key={address.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={() => {
                          setAddressInput(address.fullAddress);
                          setShipmentData({
                            ...shipmentData,
                            destination: address.fullAddress,
                          });
                          setShowDropdown(false);
                        }}
                      >
                        <div className="font-medium">
                          {address.fullAddress
                            ? `${address.fullAddress}, `
                            : ""}
                          {address.barangay}
                        </div>
                        <div className="text-sm text-gray-500">
                          {address.city}, {address.province}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="driver">Select Driver</Label>
              <Select
                value={shipmentData.driverId}
                onValueChange={(value) =>
                  setShipmentData({ ...shipmentData, driverId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose delivery personnel" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPersonnel.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} - {driver.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Delivery Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Special instructions for delivery personnel"
                value={shipmentData.note}
                onChange={(e) =>
                  setShipmentData({ ...shipmentData, note: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedDelivery">
                Estimated Delivery Date (Optional)
              </Label>
              <Input
                id="estimatedDelivery"
                type="datetime-local"
                value={shipmentData.estimatedDelivery || ""}
                onChange={(e) =>
                  setShipmentData({
                    ...shipmentData,
                    estimatedDelivery: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShipModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmShipment}
              disabled={
                !shipmentData.quantity ||
                !shipmentData.destination ||
                !shipmentData.driverId ||
                parseInt(shipmentData.quantity) <= 0 ||
                parseInt(shipmentData.quantity) > (selectedProduct?.stock || 0)
              }
            >
              Confirm Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">✏️</span>
              Edit Product
            </DialogTitle>
            <DialogDescription>
              Make changes to {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editProductData.name}
                onChange={(e) =>
                  setEditProductData({
                    ...editProductData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={editProductData.price}
                onChange={(e) =>
                  setEditProductData({
                    ...editProductData,
                    price: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stock">Stock Quantity</Label>
              <Input
                id="edit-stock"
                type="number"
                value={editProductData.stock}
                onChange={(e) =>
                  setEditProductData({
                    ...editProductData,
                    stock: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={editProductData.category}
                onChange={(e) =>
                  setEditProductData({
                    ...editProductData,
                    category: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editProductData.description}
                onChange={(e) =>
                  setEditProductData({
                    ...editProductData,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <span className="text-lg">🗑️</span>
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProduct?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
