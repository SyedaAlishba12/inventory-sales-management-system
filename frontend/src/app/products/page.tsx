"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";

import { ProductFilters } from "@/components/products/product-filters";

import {
  ProductTable,
  type Product,
} from "@/components/products/product-table";

import {
  ProductFormModal,
  type ProductFormData,
} from "@/components/products/product-form-modal";

import { ProductViewModal } from "@/components/products/product-view-modal";


// =========================================================
// TYPES
// =========================================================

interface Category {
  id: string;
  name: string;
}


// =========================================================
// BACKEND URL
// =========================================================

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";


// =========================================================
// AUTHENTICATION HELPER
// =========================================================

const getAuthHeaders = (): Record<string, string> => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("inventra_access_token")
      : null;

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};


// =========================================================
// IMAGE URL HELPER
// =========================================================
// Backend returns:
// /uploads/products/image.jpg
//
// Browser must load:
// http://localhost:8000/uploads/products/image.jpg
//
// This helper converts relative backend URLs into
// absolute FastAPI URLs.
// =========================================================

const getImageUrl = (
  imageUrl: string | null | undefined
): string | null => {
  if (!imageUrl) {
    return null;
  }

  // Already an absolute URL
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Backend returns paths like:
  // /uploads/products/abc.jpg
  if (imageUrl.startsWith("/")) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  return `${BACKEND_URL}/${imageUrl}`;
};


// =========================================================
// PRODUCTS PAGE
// =========================================================

export default function ProductsPage() {

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [isViewModalOpen, setIsViewModalOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);


  // ---------------------------------------------------------
  // FETCH CATEGORIES
  // ---------------------------------------------------------

  const fetchCategories = async () => {

    try {

      const response =
        await fetch("/api/categories");

      if (!response.ok) {
        throw new Error(
          "Failed to fetch categories"
        );
      }

      const data =
        await response.json();

      setCategories(data);

    } catch (error) {

      console.error(
        "Error fetching categories:",
        error
      );

    }
  };


  // ---------------------------------------------------------
  // FETCH PRODUCTS
  // ---------------------------------------------------------

  const fetchProducts = async (
    query = searchQuery,
    categoryId = selectedCategory
  ) => {

    try {

      setLoading(true);

      const params =
        new URLSearchParams();

      // Search by product name / SKU
      if (query.trim()) {

        params.set(
          "search",
          query.trim()
        );
      }

      // Filter by category
      if (categoryId) {

        params.set(
          "category_id",
          categoryId
        );
      }

      const queryString =
        params.toString();

      const url =
        queryString
          ? `/api/products?${queryString}`
          : "/api/products";

      const response =
        await fetch(url);

      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        console.error(
          "Product fetch error:",
          errorData
        );

        throw new Error(
          "Failed to fetch products"
        );
      }

      const data =
        await response.json();


      // -----------------------------------------------------
      // FORMAT BACKEND DATA FOR FRONTEND
      // -----------------------------------------------------

      const formattedProducts: Product[] =
        data.map((item: any) => {

          const stock =
            Number(
              item.inventory?.current_stock ?? 0
            );

          const minStock =
            Number(
              item.min_stock_level ?? 0
            );


          // IMPORTANT:
          // Convert backend relative image URL
          // into complete FastAPI URL.
          const imageUrl =
            getImageUrl(
              item.image_url
            );


          return {

            id:
              item.id,

            name:
              item.name,

            sku:
              item.sku,

            category:
              item.category?.name ||
              "General",

            categoryId:
              item.category_id,

            sellingPrice:
              Number(
                item.selling_price
              ),

            costPrice:
              Number(
                item.cost_price
              ),

            stock,

            minStock,

            status:
              stock <= minStock
                ? "Low Stock"
                : "Healthy",

            // IMPORTANT
            // This is now an absolute backend URL.
            image_url:
              imageUrl,
          };

        });


      setProducts(
        formattedProducts
      );

    } catch (error) {

      console.error(
        "Error fetching products:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------

  useEffect(() => {

    fetchCategories();

  }, []);


  // ---------------------------------------------------------
  // FETCH PRODUCTS WHEN SEARCH / CATEGORY CHANGES
  // ---------------------------------------------------------

  useEffect(() => {

    const timer =
      setTimeout(() => {

        fetchProducts(
          searchQuery,
          selectedCategory
        );

      }, 300);

    return () =>
      clearTimeout(timer);

  }, [
    searchQuery,
    selectedCategory,
  ]);


  // ---------------------------------------------------------
  // UPLOAD PRODUCT IMAGE
  // ---------------------------------------------------------

  const uploadImage = async (
    imageFile: File
  ): Promise<string | null> => {

    try {

      const formData =
        new FormData();

      formData.append(
        "file",
        imageFile
      );


      const response =
        await fetch(
          "/api/products/upload-image",
          {
            method: "POST",
            body: formData,
          }
        );


      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        console.error(
          "Image upload error:",
          errorData
        );

        throw new Error(
          "Failed to upload image"
        );
      }


      const data =
        await response.json();


      // Backend returns:
      // /uploads/products/filename.jpg
      //
      // Convert it immediately to:
      // http://localhost:8000/uploads/products/filename.jpg

      return getImageUrl(
        data.image_url
      );

    } catch (error) {

      console.error(
        "Error uploading image:",
        error
      );

      alert(
        "Product image upload failed."
      );

      return null;
    }

  };


  // =========================================================
  // ADD PRODUCT
  // =========================================================

  const handleAddProduct = async (
    productData: ProductFormData,
    imageFile: File | null
  ): Promise<boolean> => {

    try {

      let imageUrl:
        string | null =
        productData.image_url
          ? getImageUrl(
              productData.image_url
            )
          : null;


      // -----------------------------------------------------
      // UPLOAD IMAGE FIRST
      // -----------------------------------------------------

      if (imageFile) {

        imageUrl =
          await uploadImage(
            imageFile
          );

        if (!imageUrl) {
          return false;
        }

      }


      // -----------------------------------------------------
      // CREATE PRODUCT
      // -----------------------------------------------------

      const response =
        await fetch(
          "/api/products",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders(),
            },

            body: JSON.stringify({

              name:
                productData.name,

              sku:
                productData.sku,

              category_id:
                productData.category_id,

              selling_price:
                Number(
                  productData.sellingPrice
                ),

              cost_price:
                Number(
                  productData.costPrice
                ),

              min_stock_level:
                Number(
                  productData.minStock
                ),

              initial_stock:
                Number(
                  productData.stock
                ),

              image_url:
                imageUrl,
            }),
          }
        );


      // -----------------------------------------------------
      // HANDLE ERROR
      // -----------------------------------------------------

      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        console.error(
          "Server validation error:",
          errorData
        );

        alert(
          errorData?.detail ||
          "Failed to create product."
        );

        return false;
      }


      // -----------------------------------------------------
      // REFRESH PRODUCTS
      // -----------------------------------------------------

      await fetchProducts(
        searchQuery,
        selectedCategory
      );


      setIsAddModalOpen(false);

      return true;

    } catch (error) {

      console.error(
        "Error creating product:",
        error
      );

      alert(
        "Something went wrong while creating the product."
      );

      return false;
    }

  };


  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const handleEditProduct = async (
    productData: ProductFormData,
    imageFile: File | null
  ): Promise<boolean> => {

    if (!selectedProduct) {
      return false;
    }


    try {

      // Keep existing image if no new image selected.
      let imageUrl:
        string | null =
        selectedProduct.image_url
          ? getImageUrl(
              selectedProduct.image_url
            )
          : null;


      // -----------------------------------------------------
      // UPLOAD NEW IMAGE IF SELECTED
      // -----------------------------------------------------

      if (imageFile) {

        imageUrl =
          await uploadImage(
            imageFile
          );

        if (!imageUrl) {
          return false;
        }

      }


      // -----------------------------------------------------
      // UPDATE PRODUCT
      // -----------------------------------------------------

      const response =
        await fetch(
          `/api/products/${selectedProduct.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              ...getAuthHeaders(),
            },

            body: JSON.stringify({

              name:
                productData.name,

              sku:
                productData.sku,

              category_id:
                productData.category_id,

              selling_price:
                Number(
                  productData.sellingPrice
                ),

              cost_price:
                Number(
                  productData.costPrice
                ),

              min_stock_level:
                Number(
                  productData.minStock
                ),

              image_url:
                imageUrl,
            }),
          }
        );


      // -----------------------------------------------------
      // HANDLE UPDATE ERROR
      // -----------------------------------------------------

      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        console.error(
          "Update error:",
          errorData
        );

        alert(
          errorData?.detail ||
          "Failed to update product."
        );

        return false;
      }


      // -----------------------------------------------------
      // REFRESH LIST
      // -----------------------------------------------------

      await fetchProducts(
        searchQuery,
        selectedCategory
      );


      setIsEditModalOpen(false);
      setSelectedProduct(null);

      return true;

    } catch (error) {

      console.error(
        "Error updating product:",
        error
      );

      alert(
        "Something went wrong while updating the product."
      );

      return false;
    }

  };


  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDeleteProduct = async (
    product: Product
  ) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      const response =
        await fetch(
          `/api/products/${product.id}`,
          {
            method: "DELETE",

            headers: {
              ...getAuthHeaders(),
            },
          }
        );


      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null);

        alert(
          errorData?.detail ||
          "Failed to delete product."
        );

        return;
      }


      // Refresh product table
      await fetchProducts(
        searchQuery,
        selectedCategory
      );

    } catch (error) {

      console.error(
        "Error deleting product:",
        error
      );

      alert(
        "Something went wrong while deleting the product."
      );

    }

  };


  // =========================================================
  // VIEW PRODUCT
  // =========================================================

  const handleViewProduct = (
    product: Product
  ) => {

    // Make sure View modal also receives
    // a valid absolute image URL.

    const productForView: Product = {
      ...product,
      image_url:
        getImageUrl(
          product.image_url
        ),
    };

    setSelectedProduct(
      productForView
    );

    setIsViewModalOpen(true);

  };


  // =========================================================
  // EDIT CLICK
  // =========================================================

  const handleEditClick = (
    product: Product
  ) => {

    const productForEdit: Product = {
      ...product,
      image_url:
        getImageUrl(
          product.image_url
        ),
    };

    setSelectedProduct(
      productForEdit
    );

    setIsEditModalOpen(true);

  };


  // =========================================================
  // EDIT MODAL DATA
  // =========================================================

  const editProductData =
    selectedProduct
      ? {

          id:
            selectedProduct.id,

          name:
            selectedProduct.name,

          sku:
            selectedProduct.sku,

          category_id:
            selectedProduct.categoryId,

          sellingPrice:
            selectedProduct.sellingPrice,

          costPrice:
            selectedProduct.costPrice,

          stock:
            selectedProduct.stock,

          minStock:
            selectedProduct.minStock,

          image_url:
            getImageUrl(
              selectedProduct.image_url
            ),

        }
      : null;


  // =========================================================
  // UI
  // =========================================================

  return (

    <MainLayout>

      <div className="space-y-6">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">
              Product Management
            </h1>

            <p className="text-sm text-[#7A8B91]">
              Manage your inventory items, pricing,
              stock levels, images, and SKUs.
            </p>

          </div>


          <Button
            onClick={() =>
              setIsAddModalOpen(true)
            }
            className="bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90"
          >

            <Plus className="mr-2 size-4" />

            Add New Product

          </Button>

        </div>


        {/* =================================================
            SEARCH + CATEGORY FILTER
        ================================================= */}

        <ProductFilters
          searchQuery={
            searchQuery
          }

          onSearchChange={
            setSearchQuery
          }

          selectedCategory={
            selectedCategory
          }

          onCategoryChange={
            setSelectedCategory
          }

          categories={
            categories
          }
        />


        {/* =================================================
            PRODUCT TABLE
        ================================================= */}

        {loading ? (

          <div className="rounded-xl border border-[#D7E0E3] bg-card py-12 text-center text-[#7A8B91]">

            Loading products...

          </div>

        ) : (

          <ProductTable
            products={
              products
            }

            onView={
              handleViewProduct
            }

            onEdit={
              handleEditClick
            }

            onDelete={
              handleDeleteProduct
            }
          />

        )}


        {/* =================================================
            ADD PRODUCT MODAL
        ================================================= */}

        <ProductFormModal
          isOpen={
            isAddModalOpen
          }

          onClose={() =>
            setIsAddModalOpen(
              false
            )
          }

          mode="add"

          onSubmitProduct={
            handleAddProduct
          }
        />


        {/* =================================================
            EDIT PRODUCT MODAL
        ================================================= */}

        <ProductFormModal
          isOpen={
            isEditModalOpen
          }

          onClose={() => {

            setIsEditModalOpen(
              false
            );

            setSelectedProduct(
              null
            );

          }}

          mode="edit"

          initialData={
            editProductData
          }

          onSubmitProduct={
            handleEditProduct
          }
        />


        {/* =================================================
            VIEW PRODUCT MODAL
        ================================================= */}

        <ProductViewModal
          isOpen={
            isViewModalOpen
          }

          onClose={() => {

            setIsViewModalOpen(
              false
            );

            setSelectedProduct(
              null
            );

          }}

          product={
            selectedProduct
          }
        />

      </div>

    </MainLayout>

  );
}