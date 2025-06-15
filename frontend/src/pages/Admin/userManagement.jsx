import { useState, useEffect } from "react";
import useManageUserStore from "../../store/useManageUserStore";
import { useToast } from "../../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Search, Plus, Pencil, Trash2, Power, PowerOff, Download, RefreshCw, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { exportToCSV } from '../../utils/exports';
import useDepartmentStore from "../../store/useDepartmentStore";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function UserManagement() {
  const { toast } = useToast();
  const {
    users,
    isLoading,
    pagination,
    fetchUsers,
    deleteUser,
    restoreUser,
    activateUser,
    deactivateUser,
    editUser,
  } = useManageUserStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    department_id: ""
  });
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  useEffect(() => {
    loadUsers();
    fetchDepartments();
  }, [currentPage, roleFilter, statusFilter, pageSize, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      await fetchUsers({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        role: roleFilter === "all" ? undefined : roleFilter,
        is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        is_deleted: statusFilter === "deleted" ? true : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "success",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId, isActive) => {
    try {
      if (isActive) {
        await activateUser(userId);
      } else {
        await deactivateUser(userId);
      }
      toast({
        title: "Success",
        description: `User ${isActive ? "activated" : "deactivated"} successfully`,
        variant: "success",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isActive ? "activate" : "deactivate"} user`,
        variant: "destructive",
      });
    }
  };

  const formatRole = (role) => {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (value) => {
    setEditFormData(prev => ({ ...prev, department_id: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await editUser(editingUser.id, {
        ...editFormData,
        department_id: editFormData.department_id || null
      });
      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "success",
      });
      setIsEditDialogOpen(false);
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  // Sorting handler
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleViewClick = (user) => {
    setUserToView(user);
    setIsViewDialogOpen(true);
  };

  const handleRestore = async (userId) => {
    try {
      await restoreUser(userId);
      toast({
        title: "Success",
        description: "User restored successfully",
        variant: "success",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore user",
        variant: "destructive",
      });
    }
  };

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
                  <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>User Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage system users, their roles, and account status.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={loadUsers} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(users)} title="Export CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => navigate("/admin/users/add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </form>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="department_rep">Department Rep</SelectItem>
                      <SelectItem value="gso_staff">GSO Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Page size selector */}
                  <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Page size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 / page</SelectItem>
                      <SelectItem value="20">20 / page</SelectItem>
                      <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                          Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('email')}>
                          Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('role')}>
                          Role {sortBy === 'role' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('is_active')}>
                          Status {sortBy === 'is_active' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                          Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('department_name')}>
                          Department {sortBy === 'department_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{formatRole(user.role)}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                  user.is_deleted
                                    ? "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                                    : user.is_active
                                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                }`}
                              >
                                {user.is_deleted ? "Deleted" : user.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.created_at
                                ? format(new Date(user.created_at), 'PP p')
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{user.department_name || 'Not assigned'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewClick(user)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" /> View
                                  </DropdownMenuItem>
                                  {!user.is_deleted && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                                        <Pencil className="h-4 w-4 mr-2 text-muted-foreground" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleStatusChange(user.id, !user.is_active)}
                                      >
                                        {user.is_active ? (
                                          <PowerOff className="h-4 w-4 mr-2 text-yellow-600" />
                                        ) : (
                                          <Power className="h-4 w-4 mr-2 text-green-600" />
                                        )}
                                        {user.is_active ? "Deactivate" : "Activate"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteClick(user)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {user.is_deleted && (
                                    <DropdownMenuItem
                                      onClick={() => handleRestore(user.id)}
                                      className="text-green-600"
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2 text-green-600" /> Restore
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mt-2">
                  <div className="text-sm text-muted-foreground">
                    Showing {users.length} of {pagination.totalItems} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current page
                          if (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          // Show ellipsis
                          if (
                            (page === 2 && currentPage > 3) ||
                            (page === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                            disabled={currentPage === pagination.totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    <span className="ml-2 text-sm text-muted-foreground">Page {currentPage} of {pagination.totalPages}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Make changes to the user's information here.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={editFormData.role}
                    onValueChange={(value) =>
                      setEditFormData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="department_rep">Department Rep</SelectItem>
                      <SelectItem value="gso_staff">GSO Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department_id">Department</Label>
                  <Select value={editFormData.department_id ? String(editFormData.department_id) : "none"} onValueChange={value => handleDepartmentChange(value === "none" ? null : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.department_id} value={String(dept.department_id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <b>{userToDelete?.name}</b>? This will soft delete the user and they can be restored later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (userToDelete) {
                    await handleDelete(userToDelete.id);
                    setIsDeleteDialogOpen(false);
                    setUserToDelete(null);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            <div className="bg-white rounded-lg shadow-lg">
              {/* Header with Avatar */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-90"></div>
                <div className="relative flex flex-col items-center justify-center py-8 px-6">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-700 shadow-lg overflow-hidden border-4 border-white">
                    {userToView?.profile_picture ? (
                      <img 
                        src={userToView.profile_picture} 
                        alt={userToView?.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userToView?.name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="mt-4 text-xl font-semibold text-white">{userToView?.name}</div>
                  <div className="text-sm text-blue-100">{userToView?.email}</div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      userToView?.is_deleted
                        ? "bg-gray-100 text-gray-800"
                        : userToView?.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {userToView?.is_deleted ? "Deleted" : userToView?.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs text-gray-500">Role</span>
                        <span className="font-medium">{formatRole(userToView?.role)}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Department</span>
                        <span className="font-medium">{userToView?.department_name || 'Not assigned'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Created At</span>
                        <span className="font-medium">
                          {userToView?.created_at
                            ? format(new Date(userToView.created_at), "PP p")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs text-gray-500">Last Login</span>
                        <span className="font-medium">
                          {userToView?.last_login
                            ? format(new Date(userToView.last_login), "PP p")
                            : "Never"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Account Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userToView?.is_deleted
                            ? "bg-gray-100 text-gray-800"
                            : userToView?.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {userToView?.is_deleted ? "Deleted" : userToView?.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Email Verification</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userToView?.email_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {userToView?.email_verified ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                      {userToView?.is_deleted && (
                        <div>
                          <span className="block text-xs text-gray-500">Deleted At</span>
                          <span className="font-medium">
                            {userToView?.deleted_at
                              ? format(new Date(userToView.deleted_at), "PP p")
                              : "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {!userToView?.is_deleted ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            handleEdit(userToView);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit User
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            handleStatusChange(userToView.id, !userToView.is_active);
                          }}
                        >
                          {userToView?.is_active ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setIsViewDialogOpen(false);
                            handleDeleteClick(userToView);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          handleRestore(userToView.id);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restore User
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
