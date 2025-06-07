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

export default function UserManagement() {
  const { toast } = useToast();
  const {
    users,
    isLoading,
    pagination,
    fetchUsers,
    deleteUser,
    activateUser,
    deactivateUser,
    editUser,
  } = useManageUserStore();
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
  });
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter, pageSize, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      await fetchUsers({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        role: roleFilter === "all" ? undefined : roleFilter,
        is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
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
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await editUser(editingUser.id, editFormData);
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Jump to page handler
  const handleJumpPage = (e) => {
    e.preventDefault();
    const page = parseInt(jumpPage, 10);
    if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
    setJumpPage('');
  };

  const handleViewClick = (user) => {
    setUserToView(user);
    setIsViewDialogOpen(true);
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
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
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
                                  user.is_active
                                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                }`}
                              >
                                {user.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {user.created_at
                                ? format(new Date(user.created_at), 'PP p')
                                : 'N/A'}
                            </TableCell>
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
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span>Page {currentPage} of {pagination.totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(pagination.totalPages, p + 1)
                        )
                      }
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                    {/* Jump to page */}
                    <form onSubmit={handleJumpPage} className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="1"
                        max={pagination.totalPages}
                        value={jumpPage}
                        onChange={e => setJumpPage(e.target.value)}
                        className="w-16 h-8 px-2 text-sm"
                        placeholder="#"
                        aria-label="Jump to page"
                      />
                      <Button type="submit" size="sm" variant="outline">Go</Button>
                    </form>
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
                Are you sure you want to delete <b>{userToDelete?.name}</b>? This action cannot be undone.
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
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="bg-white rounded-lg shadow-lg">
              {/* Avatar */}
              <div className="flex flex-col items-center justify-center bg-blue-50 py-6">
                <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-4xl font-bold text-blue-700 shadow overflow-hidden">
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
                <div className="mt-2 text-lg font-semibold">{userToView?.name}</div>
                <div className="text-sm text-gray-500">{userToView?.email}</div>
              </div>
              <div className="px-6 py-4">
                <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <span className="block text-xs text-gray-500">Role</span>
                    <span className="font-medium">{formatRole(userToView?.role)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Status</span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      userToView?.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {userToView?.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Created</span>
                    <span>
                      {userToView?.created_at
                        ? format(new Date(userToView.created_at), "PP p")
                        : "N/A"}
                    </span>
                  </div>
                  {/* Add more fields here if needed */}
                </div>
              </div>
              <div className="px-6 pb-4 flex justify-end">
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
