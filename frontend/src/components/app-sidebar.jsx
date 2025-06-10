import * as React from "react"
import {
  FileStack,
  GalleryVerticalEnd,
  Layers,
  LayoutDashboard,
  Settings2,
  Users,
  UserCircle,
  LogOut,
  Building,
} from "lucide-react"
//import { useNavigate } from "react-router-dom"
import useAuthStore from "../store/useAuthStore"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({
  ...props
}) {
  const { user, logout } = useAuthStore();
  //const navigate = useNavigate();

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
        items: [],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: UserCircle,
        items: [],
      },
    ];

    // Admin specific items
    if (user?.role === 'admin') {
      return [
        ...commonItems,
        {
          title: "User Management",
          url: "/admin/users",
          icon: Users,
          items: [
            {
              title: "Users",
              url: "/admin/users",
            },
            {
              title: "Add User",
              url: "/admin/users/add",
            },
          ],
        },
        {
          title: "Department Management",
          url: "/admin/departments",
          icon: Building,
          items: [
            {
              title: "Departments",
              url: "/admin/departments",
            },
          ],
        },
        {
          title: "Inventory Management",
          url: "/inventory",
          icon: Layers,
          items: [
            {
              title: "Items",
              url: "/inventory/items",
            },
            {
              title: "Categories",
              url: "/inventory/categories",
            },
            {
              title: "Stock",
              url: "/inventory/stock",
            },
          ],
        },
        {
          title: "Procurement",
          url: "/procurement",
          icon: FileStack,
          items: [
            {
              title: "Requests",
              url: "/procurement/requests",
            },
            {
              title: "Orders",
              url: "/procurement/orders",
            },
            {
              title: "Suppliers",
              url: "/procurement/suppliers",
            },
          ],
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings2,
          items: [
            {
              title: "General",
              url: "/settings/general",
            },
            {
              title: "Team",
              url: "/settings/team",
            },
          ],
        },
      ];
    }

    // Department Rep specific items
    if (user?.role === 'department_rep') {
      return [
        ...commonItems,
        {
          title: "Inventory",
          url: "/inventory",
          icon: Layers,
          items: [
            {
              title: "View Items",
              url: "/inventory/items",
            },
            {
              title: "Request Items",
              url: "/inventory/request",
            },
          ],
        },
        {
          title: "Procurement",
          url: "/procurement",
          icon: FileStack,
          items: [
            {
              title: "My Requests",
              url: "/procurement/my-requests",
            },
            {
              title: "New Request",
              url: "/procurement/new-request",
            },
          ],
        },
      ];
    }

    // GSO Staff specific items
    if (user?.role === 'gso_staff') {
      return [
        ...commonItems,
        {
          title: "Inventory",
          url: "/inventory",
          icon: Layers,
          items: [
            {
              title: "Manage Items",
              url: "/inventory/manage",
            },
            {
              title: "Stock Control",
              url: "/inventory/stock",
            },
          ],
        },
        {
          title: "Procurement",
          url: "/procurement",
          icon: FileStack,
          items: [
            {
              title: "Process Requests",
              url: "/procurement/process",
            },
            {
              title: "Manage Orders",
              url: "/procurement/orders",
            },
          ],
        },
      ];
    }

    // Default items for other roles
    return commonItems;
  };

  // Pass all user fields directly for live updates
  const userData = user || {};

  const teams = [
    {
      name: "InvenTrack",
      logo: GalleryVerticalEnd,
      plan: "General Services Office",
    },
  ];

  const handleLogout = logout;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavigationItems()} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
