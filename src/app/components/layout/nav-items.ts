import {
  CheckSquare,
  FileText,
  Home,
  Package,
  ShoppingCart,
} from "lucide-react";

export const navItems = [
  { to: "/", icon: Home, label: "Home", description: "Dashboard overview" },
  {
    to: "/inventory",
    icon: Package,
    label: "Inventory",
    description: "Track household items",
  },
  {
    to: "/shopping",
    icon: ShoppingCart,
    label: "Shopping",
    description: "Manage shopping lists",
  },
  {
    to: "/tasks",
    icon: CheckSquare,
    label: "Tasks",
    description: "Household to-dos",
  },
  {
    to: "/notes",
    icon: FileText,
    label: "Notes",
    description: "Important information",
  },
] as const;
