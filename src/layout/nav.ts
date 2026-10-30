import { BadgeCheck, LayoutGrid, Settings, Users, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/users", label: "User Management", icon: Users },
  { href: "/subscription", label: "Subscription", icon: BadgeCheck },
  { href: "/settings", label: "Setting", icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
