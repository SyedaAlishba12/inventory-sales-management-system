"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/utils/api-client";

import {
  InventoryStats,
} from "@/components/inventory/inventory-stats";

import {
  InventoryTable,
  type InventoryProduct,
} from "@/components/inventory/inventory-table";

import {
  InventoryMovementTable,
  type InventoryMovement,
} from "@/components/inventory/inventory-movement-table";

import {
  LowStockAlert,
} from "@/components/inventory/low-stock-alert";

import {
  StockAdjustmentModal,
  type AdjustmentProduct,
} from "@/components/inventory/stock-adjustment-modal";


// =========================================================
// TYPES
// =========================================================

interface Product {
  id: string;
  name: string;
  sku: string;
  min_stock_level: number;
}

interface InventoryResponse {
  id: string;
  product_id: string;
  current_stock: number;
  opening_stock: number;
  damaged_stock: number;
  created_at: string;
  updated_at: string;
}

interface MovementResponse {
  id: string;
  product_id: string;
  user_id: string;
  movement_type:
    | "STOCK_IN"
    | "STOCK_OUT"
    | "DAMAGED"
    | "ADJUSTMENT";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string | null;
  created_at: string;
}


// =========================================================
// INVENTORY PAGE
// =========================================================

export default function InventoryPage() {
  const router = useRouter();

  const {
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const [inventory, setInventory] =
    useState<InventoryProduct[]>([]);

  const [movements, setMovements] =
    useState<InventoryMovement[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] =
    useState(false);


  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get<Product[]>(
        "/api/products"
      );

      setProducts(data);

      return data;
    } catch (error) {
      console.error(
        "Error fetching products:",
        error
      );

      return [];
    }
  };


  // =========================================================
  // FETCH INVENTORY
  // =========================================================

  const fetchInventory = async () => {
    try {
      const data = await apiClient.get<InventoryResponse[]>(
        "/api/inventory"
      );

      return data;
    } catch (error) {
      console.error(
        "Error fetching inventory:",
        error
      );

      return [];
    }
  };


  // =========================================================
  // FETCH MOVEMENTS
  // =========================================================

  const fetchMovements = async () => {
    try {
      const data =
        await apiClient.get<MovementResponse[]>(
          "/api/inventory/movements"
        );

      return data;
    } catch (error) {
      console.error(
        "Error fetching movements:",
        error
      );

      return [];
    }
  };


  // =========================================================
  // LOAD ALL INVENTORY DATA
  // =========================================================

  const loadInventoryData = async () => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    try {
      setLoading(true);

      const [
        productData,
        inventoryData,
        movementData,
      ] = await Promise.all([
        fetchProducts(),
        fetchInventory(),
        fetchMovements(),
      ]);


      // -----------------------------------------------------
      // PRODUCT LOOKUP
      // -----------------------------------------------------

      const productMap =
        new Map(
          productData.map(
            (product) => [
              product.id,
              product,
            ]
          )
        );


      // -----------------------------------------------------
      // FORMAT INVENTORY
      // -----------------------------------------------------

      const formattedInventory:
        InventoryProduct[] =
        inventoryData.map(
          (item) => {
            const product =
              productMap.get(
                item.product_id
              );

            return {
              id: item.id,
              product_id:
                item.product_id,
              product_name:
                product?.name ||
                "Unknown Product",
              sku:
                product?.sku ||
                "-",
              opening_stock:
                Number(
                  item.opening_stock
                ),
              current_stock:
                Number(
                  item.current_stock
                ),
              damaged_stock:
                Number(
                  item.damaged_stock
                ),
              min_stock_level:
                Number(
                  product?.min_stock_level ||
                  0
                ),
            };
          }
        );


      // -----------------------------------------------------
      // FORMAT MOVEMENTS
      // -----------------------------------------------------

      const formattedMovements:
        InventoryMovement[] =
        movementData.map(
          (movement) => {
            const product =
              productMap.get(
                movement.product_id
              );

            return {
              id: movement.id,
              product_id:
                movement.product_id,
              product_name:
                product?.name ||
                "Unknown Product",
              movement_type:
                movement.movement_type,
              quantity:
                Number(
                  movement.quantity
                ),
              previous_stock:
                Number(
                  movement.previous_stock
                ),
              new_stock:
                Number(
                  movement.new_stock
                ),
              reason:
                movement.reason,
              user_id:
                movement.user_id,
              created_at:
                movement.created_at,
            };
          }
        );


      setInventory(
        formattedInventory
      );

      setMovements(
        formattedMovements
      );

    } catch (error) {
      console.error(
        "Error loading inventory data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // AUTH CHECK + INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    loadInventoryData();
  }, [
    authLoading,
    isAuthenticated,
  ]);


  // =========================================================
  // CALCULATE STATS
  // =========================================================

  const stats = useMemo(() => {
    const openingStock =
      inventory.reduce(
        (total, item) =>
          total +
          item.opening_stock,
        0
      );


    const stockIn =
      movements
        .filter(
          (movement) =>
            movement.movement_type ===
            "STOCK_IN"
        )
        .reduce(
          (total, movement) =>
            total +
            movement.quantity,
          0
        );


    const stockOut =
      movements
        .filter(
          (movement) =>
            movement.movement_type ===
            "STOCK_OUT"
        )
        .reduce(
          (total, movement) =>
            total +
            movement.quantity,
          0
        );


    const currentStock =
      inventory.reduce(
        (total, item) =>
          total +
          item.current_stock,
        0
      );


    const damagedStock =
      inventory.reduce(
        (total, item) =>
          total +
          item.damaged_stock,
        0
      );


    const lowStockCount =
      inventory.filter(
        (item) =>
          item.current_stock <=
          item.min_stock_level
      ).length;


    return {
      openingStock,
      stockIn,
      stockOut,
      currentStock,
      damagedStock,
      lowStockCount,
    };
  }, [
    inventory,
    movements,
  ]);


  // =========================================================
  // LOW STOCK ITEMS
  // =========================================================

  const lowStockItems =
    useMemo(() => {
      return inventory
        .filter(
          (item) =>
            item.current_stock <=
            item.min_stock_level
        )
        .map((item) => ({
          id: item.id,
          product_id:
            item.product_id,
          product_name:
            item.product_name,
          sku:
            item.sku,
          current_stock:
            item.current_stock,
          min_stock_level:
            item.min_stock_level,
        }));
    }, [inventory]);


  // =========================================================
  // ADJUSTMENT PRODUCTS
  // =========================================================

  const adjustmentProducts:
    AdjustmentProduct[] =
    products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
    }));


  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#0F4C5C]" />

            <p className="mt-3 text-sm text-[#7A8B91]">
              Checking authentication...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F4C5C]">
              Inventory Management
            </h1>

            <p className="text-sm text-[#7A8B91]">
              Track stock levels, inventory movements,
              damaged stock, and low-stock items.
            </p>
          </div>


          <div className="flex gap-2">

            <Button
              variant="outline"
              onClick={
                loadInventoryData
              }
              disabled={
                loading ||
                authLoading ||
                !isAuthenticated
              }
              className="border-[#D7E0E3] text-[#0F4C5C]"
            >

              <RefreshCw
                className={`mr-2 size-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </Button>


            <Button
              onClick={() =>
                setIsAdjustmentModalOpen(
                  true
                )
              }
              disabled={!isAuthenticated}
              className="bg-[#0F4C5C] text-white hover:bg-[#0F4C5C]/90"
            >

              <Plus className="mr-2 size-4" />

              Adjust Stock
            </Button>

          </div>
        </div>


        {/* =================================================
            INVENTORY STATS
        ================================================= */}

        <InventoryStats
          openingStock={
            stats.openingStock
          }
          stockIn={
            stats.stockIn
          }
          stockOut={
            stats.stockOut
          }
          currentStock={
            stats.currentStock
          }
          damagedStock={
            stats.damagedStock
          }
          lowStockCount={
            stats.lowStockCount
          }
        />


        {/* =================================================
            LOW STOCK ALERT
        ================================================= */}

        <LowStockAlert
          items={
            lowStockItems
          }
        />


        {/* =================================================
            INVENTORY TABLE
        ================================================= */}

        {loading ? (
          <div className="rounded-xl border border-[#D7E0E3] bg-card py-12 text-center text-[#7A8B91]">
            Loading inventory...
          </div>
        ) : (
          <InventoryTable
            inventory={
              inventory
            }
          />
        )}


        {/* =================================================
            INVENTORY MOVEMENTS
        ================================================= */}

        {!loading && (
          <InventoryMovementTable
            movements={
              movements
            }
          />
        )}


        {/* =================================================
            STOCK ADJUSTMENT MODAL
        ================================================= */}

        <StockAdjustmentModal
          isOpen={
            isAdjustmentModalOpen
          }

          products={
            adjustmentProducts
          }

          onClose={() =>
            setIsAdjustmentModalOpen(
              false
            )
          }

          onSuccess={
            loadInventoryData
          }
        />

      </div>
    </MainLayout>
  );
}