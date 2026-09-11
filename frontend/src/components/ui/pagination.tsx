"use client"; 
 
import { ChevronLeft, ChevronRight } from "lucide-react"; 
 
import { Button } from "@/components/ui/button"; 
 
interface PaginationProps { 
  page: number; 
  totalPages: number; 
  onPageChange: (page: number) => void; 
  disabled?: boolean; 
} 
 
export function Pagination({ disabled = false, onPageChange, page, totalPages }: PaginationProps) { 
  const safeTotal = Math.max(1, totalPages); 
  const safePage = Math.min(Math.max(1, page), safeTotal); 
 
  return ( 
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4"> 
      <p className="text-sm text-[#7A8B91]"> 
        Page <span className="font-medium text-[#0F4C5C]">{safePage}</span> of {safeTotal} 
      </p> 
      <div className="flex items-center gap-2"> 
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || safePage <= 1} 
          onClick={() => onPageChange(safePage - 1)} 
        > 
          <ChevronLeft className="size-4" /> 
          Previous 
        </Button> 
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || safePage >= safeTotal} 
          onClick={() => onPageChange(safePage + 1)} 
        > 
          Next 
          <ChevronRight className="size-4" /> 
        </Button> 
      </div> 
    </nav> 
  ); 
} 