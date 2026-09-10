import { Mail, MapPin, Phone, ShoppingBag } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerSummary } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { getInitials } from "@/utils/format";

export function CustomerCard({ customer }: { customer: CustomerSummary }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Avatar className="size-11">
            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{customer.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Customer #{customer.id}</p>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          {customer.phone ? <p className="flex items-center gap-2"><Phone className="size-4" />{customer.phone}</p> : null}
          {customer.email ? <p className="flex items-center gap-2 truncate"><Mail className="size-4 shrink-0" />{customer.email}</p> : null}
          {customer.address ? <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /><span className="line-clamp-2">{customer.address}</span></p> : null}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Total spending</p>
            <p className="mt-1 text-sm font-bold">{formatCurrency(customer.totalSpending || 0)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><ShoppingBag className="size-3.5" />Purchases</p>
            <p className="mt-1 text-sm font-bold">{customer.purchaseCount || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
