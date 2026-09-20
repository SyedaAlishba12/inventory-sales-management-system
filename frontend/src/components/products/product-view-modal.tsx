"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

import type { Product } from "@/components/products/product-table";

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductViewModal({
  isOpen,
  onClose,
  product,
}: ProductViewModalProps) {

  if (!product) return null;

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title="Product Details"
      description="View complete product information."
      size="md"
      footer={
        <div className="flex justify-end">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>

        </div>
      }
    >

      <div className="space-y-5">

        {/* IMAGE */}

        <div className="flex justify-center">

          <div className="h-48 w-48 overflow-hidden rounded-xl border border-[#D7E0E3] bg-[#F5F8F9]">

            {product.image_url ? (

              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain"
              />

            ) : (

              <div className="flex h-full items-center justify-center text-sm text-[#7A8B91]">
                No Image
              </div>

            )}

          </div>

        </div>


        {/* DETAILS */}

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              Product Name
            </p>

            <p className="mt-1 font-semibold text-[#0F4C5C]">
              {product.name}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              SKU
            </p>

            <p className="mt-1 font-semibold text-[#0F4C5C]">
              {product.sku}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              Category
            </p>

            <p className="mt-1 text-[#52646A]">
              {product.category}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              Current Stock
            </p>

            <p className="mt-1 font-semibold text-[#0F4C5C]">
              {product.stock} units
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              Cost Price
            </p>

            <p className="mt-1 text-[#52646A]">
              Rs {product.costPrice.toLocaleString()}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              Selling Price
            </p>

            <p className="mt-1 font-semibold text-[#0F4C5C]">
              Rs {product.sellingPrice.toLocaleString()}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              Minimum Stock
            </p>

            <p className="mt-1 text-[#52646A]">
              {product.minStock} units
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase text-[#7A8B91]">
              Status
            </p>

            <p
              className={`mt-1 font-semibold ${
                product.status === "Healthy"
                  ? "text-[#52B788]"
                  : "text-[#E67E72]"
              }`}
            >
              {product.status}
            </p>
          </div>

        </div>

      </div>

    </Modal>
  );
}