"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Scan, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import type { FormData, Product } from "@/types/product-types";
import { ProductFilters } from "./product-filters";
import { ProductTable } from "./product-table";
import { ProductDialog } from "./product-dialog";
import { ObjectDetectionModal } from "./object-detection-model";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useObjectDetection } from "@/lib/hooks/use-object-detection";

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: "",
  });

  const {
    detectedProduct,
    detectionResponse,
    isLoading: detectionLoading,
    startDetection,
    clearDetection,
    handleProductFound,
    populateForm,
    getDetectionMessage,
    isExistingProduct,
    isSuggestion,
  } = useObjectDetection();

  const [isObjectDetectionOpen, setIsObjectDetectionOpen] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter && categoryFilter !== "all")
        params.append("category", categoryFilter);
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      } else {
        if (mounted) {
          toast.error("Error", {
            description: data.error || "Failed to fetch products",
            richColors: true,
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (mounted) {
        toast.error("Error", {
          description: (error as Error).message || "Failed to fetch products",
          richColors: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter, mounted]);

  // Load products on component mount and when filters change
  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted, fetchProducts]);

  // Debounced search
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter, mounted, fetchProducts]);

  // Handle detection results
  useEffect(() => {
    if (detectedProduct) {
      const message = getDetectionMessage();

      if (isExistingProduct()) {
        // If it's an existing product, highlight it in search
        setSearchTerm(detectedProduct.name);
        toast.success("Product Found!", {
          description: message,
          richColors: true,
        });
      } else if (isSuggestion()) {
        // If it's a suggestion, offer to populate the form
        toast.success("Product Suggestion!", {
          description: `${message}. Click "Use Suggestion" to populate the form.`,
          richColors: true,
          duration: 5000,
        });
      } else {
        toast.info("Product Template", {
          description: message,
          richColors: true,
        });
      }
    }
  }, [
    detectedProduct,
    detectionResponse,
    getDetectionMessage,
    isExistingProduct,
    isSuggestion,
  ]);

  const handleObjectDetection = () => {
    setIsObjectDetectionOpen(true);
    startDetection();
  };

  const handleUseSuggestion = () => {
    if (detectedProduct) {
      populateForm(setFormData);
      setIsAddDialogOpen(true);
      clearDetection();
      toast.success("Form Populated!", {
        description: "Product information has been filled in the form.",
        richColors: true,
      });
    }
  };

  const handleEditExisting = () => {
    if (detectedProduct && detectedProduct._id) {
      // Find the product in the current list and open edit dialog
      const product = products.find((p) => p._id === detectedProduct._id);
      if (product) {
        openEditDialog(product);
        clearDetection();
      }
    }
  };

  // Add new product
  const handleAddProduct = async () => {
    try {
      setSubmitting(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          description: formData.description,
          image: formData.image,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Success", {
          description: "Product created successfully",
          richColors: true,
        });
        setIsAddDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        toast.error("Error", {
          description: data.error || "Failed to create product",
          richColors: true,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: (error as Error).message || "Failed to create product",
        richColors: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Edit existing product
  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          description: formData.description,
          image: formData.image,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Success", {
          description: "Product updated successfully",
          richColors: true,
        });
        setIsEditDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        toast.error("Error", {
          description: data.error || "Failed to update product",
          richColors: true,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: (error as Error).message || "Failed to update product",
        richColors: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Success", {
          description: "Product deleted successfully",
          richColors: true,
        });
        fetchProducts();
      } else {
        toast.error("Error", {
          description: data.error || "Failed to delete product",
          richColors: true,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: (error as Error).message || "Failed to delete product",
        richColors: true,
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      image: product.image || "",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      image: "",
    });
    setSelectedProduct(null);
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleObjectDetection}
            className="flex items-center gap-2 bg-transparent"
            disabled={detectionLoading}
          >
            <Scan className="h-4 w-4" />
            {detectionLoading ? "Detecting..." : "Detect Object"}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Detection Results Alert */}
      {detectedProduct && (
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            {isExistingProduct() ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : isSuggestion() ? (
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription className="text-sm">
                <strong>{getDetectionMessage()}</strong>
                <div className="mt-2 flex gap-2">
                  {isExistingProduct() && detectedProduct._id && (
                    <Button size="sm" onClick={handleEditExisting}>
                      Edit Product
                    </Button>
                  )}
                  {(isSuggestion() || !isExistingProduct()) && (
                    <Button size="sm" onClick={handleUseSuggestion}>
                      Use Suggestion
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={clearDetection}>
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        products={products}
      />

      <ProductTable
        products={products}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={handleDeleteProduct}
      />

      <ProductDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="add"
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddProduct}
        submitting={submitting}
      />

      <ProductDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditProduct}
        submitting={submitting}
        selectedProduct={selectedProduct}
      />

      <ObjectDetectionModal
        isOpen={isObjectDetectionOpen}
        onOpenChange={setIsObjectDetectionOpen}
        onProductFound={handleProductFound}
      />
    </div>
  );
};

export default ProductPage;
