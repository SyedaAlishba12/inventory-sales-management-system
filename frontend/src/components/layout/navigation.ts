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

export type NavigationRole = "admin" | "staff";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: NavigationRole[];
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const defaultNavigation: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "staff"],
      },
      {
        label: "Point of Sale",
        href: "/pos",
        icon: ShoppingCart,
        roles: ["admin", "staff"],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: PackageSearch,
        roles: ["admin", "staff"],
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: Warehouse,
        roles: ["admin", "staff"],
      },
      {
        label: "Sales",
        href: "/sales",
        icon: CircleDollarSign,
        roles: ["admin", "staff"],
      },
      {
        label: "Purchases",
        href: "/purchases",
        icon: Boxes,
        roles: ["admin"],
      },
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: Truck,
        roles: ["admin"],
      },
      {
        label: "Customers",
        href: "/customers",
        icon: Users,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
        roles: ["admin"],
      },
      {
        label: "Activity Log",
        href: "/activity-logs",
        icon: Activity,
        roles: ["admin"],
      },
    ],
  },
];