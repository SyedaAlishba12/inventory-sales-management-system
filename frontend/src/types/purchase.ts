export interface PurchaseItemCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface PurchaseItemResponse {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
}

export interface PurchaseCreate {
  supplier_id: string;
  items: PurchaseItemCreate[];
  notes?: string | null;
}

export interface PurchaseUpdate {
  payment_status?: string | null;
  notes?: string | null;
}

export interface PurchaseResponse {
  id: string;
  supplier_id: string;
  payment_status: string;
  purchase_status: string;
  total_amount: number | string;
  notes: string | null;
  items: PurchaseItemResponse[];
}
