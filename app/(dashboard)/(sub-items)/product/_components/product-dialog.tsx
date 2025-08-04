"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

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

interface FormData {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  image: string;
}

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: () => void;
  submitting: boolean;
  selectedProduct?: Product | null;
}

export const ProductDialog = ({
  isOpen,
  onOpenChange,
  mode,
  formData,
  setFormData,
  onSubmit,
  submitting,
}: ProductDialogProps) => {
  const isEdit = mode === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Make changes to your product here."
              : "Create a new product in your inventory."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-name`}>Product Name</Label>
            <Input
              id={`${mode}-name`}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-sku`}>SKU</Label>
            <Input
              id={`${mode}-sku`}
              value={formData.sku}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sku: e.target.value.toUpperCase(),
                })
              }
              placeholder="e.g., PROD-001"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-category`}>Category</Label>
            <Input
              id={`${mode}-category`}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-price`}>Price</Label>
              <Input
                id={`${mode}-price`}
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-stock`}>Stock</Label>
              <Input
                id={`${mode}-stock`}
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-image`}>Image URL (Optional)</Label>
            <Input
              id={`${mode}-image`}
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-description`}>Description</Label>
            <Textarea
              id={`${mode}-description`}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Saving..." : "Adding..."}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
