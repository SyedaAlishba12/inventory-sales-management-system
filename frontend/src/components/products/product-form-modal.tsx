"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  category_id: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  image_url?: string | null;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;

  mode?: "add" | "edit";

  initialData?: {
    id?: string;
    name: string;
    sku: string;
    category_id: string;
    sellingPrice: number;
    costPrice: number;
    stock: number;
    minStock: number;
    image_url?: string | null;
  } | null;

  onSubmitProduct: (
    product: ProductFormData,
    imageFile: File | null
  ) => Promise<boolean>;
}

export function ProductFormModal({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onSubmitProduct,
}: ProductFormModalProps) {

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    sellingPrice: "",
    costPrice: "",
    stock: "",
    minStock: "",
  });

  // ---------------------------------------------------------
  // LOAD CATEGORIES
  // ---------------------------------------------------------

  useEffect(() => {

    if (!isOpen) return;

    fetch("/api/categories")
      .then(async (res) => {

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        return res.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error(
          "Error fetching categories:",
          err
        );
      });

  }, [isOpen]);


  // ---------------------------------------------------------
  // LOAD INITIAL DATA FOR EDIT
  // ---------------------------------------------------------

  useEffect(() => {

    if (!isOpen) return;

    if (mode === "edit" && initialData) {

      setFormData({
        name: initialData.name || "",
        sku: initialData.sku || "",
        category_id: initialData.category_id || "",
        sellingPrice:
          initialData.sellingPrice?.toString() || "",
        costPrice:
          initialData.costPrice?.toString() || "",
        stock:
          initialData.stock?.toString() || "",
        minStock:
          initialData.minStock?.toString() || "",
      });

      setImagePreview(
        initialData.image_url || null
      );

      setImageFile(null);

    } else {

      setFormData({
        name: "",
        sku: "",
        category_id: "",
        sellingPrice: "",
        costPrice: "",
        stock: "",
        minStock: "",
      });

      setImagePreview(null);
      setImageFile(null);
    }

  }, [isOpen, mode, initialData]);


  // ---------------------------------------------------------
  // IMAGE SELECTION
  // ---------------------------------------------------------

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please select a JPG, PNG or WEBP image."
      );
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image size must be less than 5MB."
      );
      return;
    }

    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };


  // ---------------------------------------------------------
  // REMOVE IMAGE
  // ---------------------------------------------------------

  const removeImage = () => {

    setImageFile(null);
    setImagePreview(null);
  };


  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (saving) return;

    setSaving(true);

    try {

      const success =
        await onSubmitProduct(
          {
            name: formData.name,
            sku: formData.sku,
            category_id: formData.category_id,

            sellingPrice:
              Number(formData.sellingPrice) || 0,

            costPrice:
              Number(formData.costPrice) || 0,

            stock:
              Number(formData.stock) || 0,

            minStock:
              Number(formData.minStock) || 5,

            image_url:
              imagePreview,
          },
          imageFile
        );

      // Only clear form after SUCCESS
      if (success) {

        setFormData({
          name: "",
          sku: "",
          category_id: "",
          sellingPrice: "",
          costPrice: "",
          stock: "",
          minStock: "",
        });

        setImageFile(null);
        setImagePreview(null);
      }

    } finally {

      setSaving(false);
    }
  };


  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title={
        mode === "edit"
          ? "Edit Product"
          : "Add New Product"
      }
      description={
        mode === "edit"
          ? "Update product details."
          : "Enter the details of the new product."
      }
      size="md"

      footer={
        <div className="flex justify-end gap-3">

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#0F4C5C] text-white"
          >
            {saving
              ? "Saving..."
              : mode === "edit"
                ? "Update Product"
                : "Save Product"}
          </Button>

        </div>
      }
    >

      <form
        onSubmit={handleSubmit}
        className="space-y-4 py-2"
      >

        {/* PRODUCT NAME */}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
            Product Name
          </label>

          <Input
            required
            placeholder="e.g. Wireless Mouse"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />
        </div>


        {/* SKU + CATEGORY */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
              SKU Code
            </label>

            <Input
              required
              placeholder="e.g. MOUSE-002"
              value={formData.sku}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sku: e.target.value,
                })
              }
            />
          </div>


          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
              Category
            </label>

            <select
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-[#0F4C5C] shadow-sm"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category_id: e.target.value,
                })
              }
            >

              <option value="">
                Select Category
              </option>

              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name}
                </option>
              ))}

            </select>
          </div>

        </div>


        {/* COST + SELLING PRICE */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
              Cost Price (Rs)
            </label>

            <Input
              type="number"
              min="0"
              required
              placeholder="1800"
              value={formData.costPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  costPrice: e.target.value,
                })
              }
            />
          </div>


          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
              Selling Price (Rs)
            </label>

            <Input
              type="number"
              min="0"
              required
              placeholder="2500"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPrice: e.target.value,
                })
              }
            />
          </div>

        </div>


        {/* STOCK */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
              Initial Stock
            </label>

            <Input
              type="number"
              min="0"
              required
              placeholder="50"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: e.target.value,
                })
              }
            />
          </div>


          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
              Minimum Stock Alert
            </label>

            <Input
              type="number"
              min="0"
              required
              placeholder="10"
              value={formData.minStock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minStock: e.target.value,
                })
              }
            />
          </div>

        </div>


        {/* IMAGE UPLOAD */}

        <div>

          <label className="mb-1 block text-xs font-semibold uppercase text-[#52646A]">
            Product Image
          </label>

          <div className="rounded-lg border border-dashed border-[#D7E0E3] p-4">

            {imagePreview ? (

              <div className="relative">

                <img
                  src={
                    imagePreview.startsWith("blob:")
                      ? imagePreview
                      : imagePreview.startsWith("http")
                        ? imagePreview
                        : imagePreview
                  }
                  alt="Product preview"
                  className="h-40 w-full rounded-md object-contain bg-[#F5F8F9]"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
                >
                  <X className="size-4 text-red-500" />
                </button>

              </div>

            ) : (

              <label className="flex cursor-pointer flex-col items-center justify-center py-6">

                <Upload className="mb-2 size-7 text-[#0F4C5C]" />

                <span className="text-sm font-medium text-[#0F4C5C]">
                  Choose Product Image
                </span>

                <span className="mt-1 text-xs text-[#7A8B91]">
                  JPG, PNG or WEBP — Max 5MB
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />

              </label>

            )}

          </div>

        </div>

      </form>

    </Modal>
  );
}