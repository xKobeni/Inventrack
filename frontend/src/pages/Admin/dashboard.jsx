import React, { useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import useDashboardStore from '@/store/useDashboardStore'
import { Users, Building2, Package, ClipboardList, Activity, AlertCircle } from 'lucide-react'

const Dashboard = () => {
  const {
    isLoading,
    error,
    dashboardData,
    fetchDashboardData
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, loading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  const ActivityCard = ({ activities, loading }) => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.user_name} - {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink href="#">
                            Dashboard
                          </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {error && (
              <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={dashboardData?.system?.total_users || 0}
                icon={Users}
                loading={isLoading}
              />
              <StatCard
                title="Departments"
                value={dashboardData?.system?.total_departments || 0}
                icon={Building2}
                loading={isLoading}
              />
              <StatCard
                title="Inventory Items"
                value={dashboardData?.system?.total_items || 0}
                icon={Package}
                loading={isLoading}
              />
              <StatCard
                title="Procurement Requests"
                value={dashboardData?.system?.total_requests || 0}
                icon={ClipboardList}
                loading={isLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <ActivityCard
                activities={dashboardData?.recent_activities}
                loading={isLoading}
              />
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Admins</span>
                        <span className="font-medium">{dashboardData?.system?.total_admins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">GSO Staff</span>
                        <span className="font-medium">{dashboardData?.system?.total_gso_staff || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Department Reps</span>
                        <span className="font-medium">{dashboardData?.system?.total_dept_reps || 0}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
        </div>
        </SidebarInset>
    </SidebarProvider>
  )
}

export default Dashboard