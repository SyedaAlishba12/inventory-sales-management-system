import { FilterBar } from "@/components/shared/filter-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesFiltersProps {
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export function SalesFilters({
  paymentMethod,
  onPaymentMethodChange,
  status,
  onStatusChange,
  onReset,
}: SalesFiltersProps) {
  return (
    <FilterBar hasActiveFilters={!!(paymentMethod || status)} onReset={onReset}>
      <Select value={paymentMethod || undefined} onValueChange={onPaymentMethodChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CASH">Cash</SelectItem>
          <SelectItem value="CARD">Card</SelectItem>
          <SelectItem value="ONLINE">Online</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status || undefined} onValueChange={onStatusChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}
