import {
  Activity,
  BarChart3,
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const defaultNavigation: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Point of Sale", href: "/pos", icon: ShoppingCart },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Products", href: "/products", icon: PackageSearch },
      { label: "Inventory", href: "/inventory", icon: Warehouse },
      { label: "Sales", href: "/sales", icon: CircleDollarSign },
      { label: "Purchases", href: "/purchases", icon: Boxes },
      { label: "Suppliers", href: "/suppliers", icon: Truck },
      { label: "Customers", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Activity Log", href: "/activity-logs", icon: Activity },
    ],
  },
];
