"use client"

import { ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (url) => {
    navigate(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive || location.pathname.startsWith(item.url)}
            className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.title}
                  onClick={() => item.items.length === 0 && handleNavigation(item.url)}
                  className={location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items.length > 0 && (
                    <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton 
                        asChild
                        className={location.pathname === subItem.url ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}>
                        <a href={subItem.url} onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(subItem.url);
                        }}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
