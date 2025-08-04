"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconSearch,
  IconSettings,
  IconTruckFilled,
  IconUsers,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavAdminActions } from "./nav-admin-actions";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  BoxIcon,
  EyeIcon,
  History,
  NotepadTextIcon,
  TruckIcon,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { NavProductActions } from "./nav-product-actions";
import { NavShipmentActions } from "./nav-shipments-actions";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "To deliver",
      url: "/to-deliver",
      icon: IconTruckFilled,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
  ],
  navProduct: [
    {
      name: "View All Products",
      url: "/view-all-products",
      icon: EyeIcon,
    },
    {
      name: "Manage Products",
      url: "/product",
      icon: BoxIcon,
    },
    {
      name: "Product History",
      url: "/product-history",
      icon: History,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  adminActions: [
    {
      name: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      name: "Assign Shipments",
      url: "/assign-shipments",
      icon: NotepadTextIcon,
    },
  ],
  shipmentActions: [
    {
      name: "Shipments",
      url: "/shipments",
      icon: TruckIcon,
    },
  ],
};

type UserData = {
  name: string;
  email: string;
  image: string;
  role?: string;
} | null;

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: UserData }) {
  // Debug logging - remove this after fixing
  React.useEffect(() => {
    console.log("User data:", user);
    console.log("User role:", user?.role);
    console.log("Is admin?", user?.role === "admin");
    console.log("Role type:", typeof user?.role);
  }, [user]);

  // More flexible admin checking
  const isAdmin = React.useMemo(() => {
    if (!user?.role) return false;

    const role = user.role.toLowerCase().trim();
    return (
      role === "admin" || role === "administrator" || role === "super_admin"
    );
  }, [user?.role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Warehouse className="!size-5" />
                <span className="text-base font-semibold">LGW Warehouse</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProductActions items={data.navProduct} />
        {/* admin actions */}
        {isAdmin && <NavAdminActions items={data.adminActions} />}
        {/* shipment actions */}
        {isAdmin && <NavShipmentActions items={data.shipmentActions} />}

        <NavSecondary items={data.navSecondary} className="mt-auto " />

        {/* Debug info - remove after fixing, check the role of the user */}
        {process.env.NODE_ENV === "development" && (
          <div className="p-2 text-xs bg-yellow-100 border-l-4 border-yellow-500">
            <div>Role: {user?.role || "null"}</div>
            <div>Is Admin: {isAdmin ? "Yes" : "No"}</div>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
