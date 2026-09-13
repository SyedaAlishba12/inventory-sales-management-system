"use client"; 
 
import { Package, Search } from "lucide-react"; 
 
import { SearchBar } from "@/components/shared/search-bar"; 
import { Spinner } from "@/components/ui/spinner"; 
import type { PosProduct } from "@/types"; 
import { formatCurrency } from "@/utils/currency"; 
 
interface ProductSearchProps { 
  value: string; 
  onChange: (value: string) => void; 
  results: PosProduct[]; 
  onSelect: (product: PosProduct) => void; 
  loading?: boolean; 
  minimumCharacters?: number; 
} 
 
export function ProductSearch({ loading, minimumCharacters = 1, onChange, onSelect, results, value }: ProductSearchProps) { 
  const canShowResults = value.trim().length >= minimumCharacters; 
 
  return ( 
    <div className="relative"> 
      <SearchBar value={value} onChange={onChange} placeholder="Search products by name or SKU..." /> 
      {canShowResults ? ( 
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-[#D7E0E3] bg-card p-1 shadow-xl"> 
          {loading ? ( 
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-[#7A8B91]"><Spinner />Searching products...</div> 
          ) : results.length > 0 ? ( 
            results.map((product) => ( 
              <button 
                key={product.id} 
                type="button" 
                disabled={product.stockQuantity <= 0} 
                onClick={() => onSelect(product)} 
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition hover:bg-[#EAF0F2] focus-visible:bg-[#78A394]/10 focus-visible:ring-2 focus-visible:ring-[#78A394] disabled:cursor-not-allowed disabled:opacity-50" 
              > 
                <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#EAF0F2]"> 
                  {product.imageUrl ? ( 
                    // eslint-disable-next-line @next/next/no-img-element 
                    <img src={product.imageUrl} alt="" loading="lazy" className="size-full object-cover" /> 
                  ) : <Package className="size-5 text-[#7A8B91]" />} 
                </span> 
                <span className="min-w-0 flex-1"> 
                  <span className="block truncate text-sm font-semibold text-[#0F4C5C]">{product.name}</span> 
                  <span className="block text-xs text-[#7A8B91]">{product.sku} · {product.stockQuantity} in stock</span> 
                </span> 
                <span className="text-sm font-bold text-[#0F4C5C]">{formatCurrency(product.price)}</span> 
              </button> 
            )) 
          ) : ( 
            <div className="flex flex-col items-center p-6 text-center text-sm text-[#7A8B91]"> 
              <Search className="mb-2 size-5" /> 
              No matching products 
            </div> 
          )} 
        </div> 
      ) : null} 
    </div> 
  ); 
} 