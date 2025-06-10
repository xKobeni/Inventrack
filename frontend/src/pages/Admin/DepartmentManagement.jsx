import React, { useEffect, useState } from 'react';
import useDepartmentStore from '../../store/useDepartmentStore';
import useManageUserStore from '../../store/useManageUserStore';
import { useToast } from "../../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MoreHorizontal, Search, Plus, Pencil, Trash2, Power, PowerOff, Download, RefreshCw, Eye, Building } from "lucide-react";
import { format } from 'date-fns';
import { exportToCSV } from '../../utils/exports';
import { getAvailableUsers } from "../../services/helper";

const DepartmentManagement = () => {
  const { toast } = useToast();
  const {
    departments,
    isLoading,
    error,
    pagination,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    activateDepartment,
    deactivateDepartment,
  } = useDepartmentStore();

  const { users, fetchUsers } = useManageUserStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Default form state
  const defaultFormData = {
    name: "",
    description: "",
    contact_email: "",
    contact_number: "",
    head_user_id: null,
    logo: null,
    logo_type: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    loadDepartments();
    loadUsers();
  }, [currentPage, statusFilter, pageSize, sortBy, sortOrder]);

  const loadDepartments = async () => {
    try {
      await fetchDepartments({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load departments",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      await fetchUsers({
        is_active: true
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
    loadDepartments();
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await addDepartment(formData);
      toast({
        title: "Success",
        description: "Department added successfully",
        variant: "success",
      });
      setIsAddDialogOpen(false);
      setFormData(defaultFormData);
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add department",
        variant: "destructive",
      });
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    try {
      await updateDepartment(selectedDepartment.department_id, formData);
      toast({
        title: "Success",
        description: "Department updated successfully",
        variant: "success",
      });
      setIsEditDialogOpen(false);
      resetForm();
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async () => {
    try {
      await deleteDepartment(selectedDepartment.department_id);
      toast({
        title: "Success",
        description: "Department deleted successfully",
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (departmentId, isActive) => {
    try {
      if (isActive) {
        await activateDepartment(departmentId);
      } else {
        await deactivateDepartment(departmentId);
      }
      toast({
        title: "Success",
        description: `Department ${isActive ? "activated" : "deactivated"} successfully`,
        variant: "success",
      });
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isActive ? "activate" : "deactivate"} department`,
        variant: "destructive",
      });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result,
          logo_type: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setSelectedDepartment(null);
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      contact_email: department.contact_email || "",
      contact_number: department.contact_number || "",
      head_user_id: department.head_user_id || "",
      logo: department.logo,
      logo_type: department.logo_type,
      is_active: department.is_active
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (department) => {
    setSelectedDepartment(department);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
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

  // Helper to get selected user object
  const selectedHeadUser = users.find(user => String(user.id) === String(formData.head_user_id));

  // Reset form when opening Add Department dialog
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData(defaultFormData);
    }
  }, [isAddDialogOpen]);

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

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
                  <BreadcrumbPage>Department Management</BreadcrumbPage>
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
                  <CardTitle>Department Management</CardTitle>
                  <CardDescription>
                    Manage departments, their details, and status.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={loadDepartments} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(departments)} title="Export CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
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
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </form>
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

                {/* Departments Table */}
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                          Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Head</TableHead>
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
                          <TableCell colSpan={7} className="text-center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : departments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No departments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        departments.map((department) => (
                          <TableRow key={department.department_id}>
                            <TableCell className="font-medium">{department.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{department.description || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {department.contact_email && (
                                  <div>{department.contact_email}</div>
                                )}
                                {department.contact_number && (
                                  <div>{department.contact_number}</div>
                                )}
                                {!department.contact_email && !department.contact_number && (
                                  <div>N/A</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{department.head_name || 'Not assigned'}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                  department.is_active
                                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                }`}
                              >
                                {department.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {department.created_at
                                ? format(new Date(department.created_at), 'PP p')
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
                                  <DropdownMenuItem onClick={() => handleView(department)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" /> View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(department)}>
                                    <Pencil className="h-4 w-4 mr-2 text-muted-foreground" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(department.department_id, !department.is_active)}
                                  >
                                    {department.is_active ? (
                                      <PowerOff className="h-4 w-4 mr-2 text-yellow-600" />
                                    ) : (
                                      <Power className="h-4 w-4 mr-2 text-green-600" />
                                    )}
                                    {department.is_active ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(department)}
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
                    Showing {departments.length} of {pagination.totalItems} departments
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

        {/* Add Department Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
              <DialogDescription>
                Create a new department with all its details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head_user_id">Department Head</Label>
                  <Select
                    value={formData.head_user_id ? String(formData.head_user_id) : "none"}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, head_user_id: value === "none" ? null : value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department head" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {getAvailableUsers(users, departments).map(user => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.head_user_id && selectedHeadUser && (
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Selected:</span> {selectedHeadUser.name} ({selectedHeadUser.email})
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="logo">Department Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Department Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update department information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditDepartment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-head_user_id">Department Head</Label>
                  <Select
                    value={formData.head_user_id ? String(formData.head_user_id) : "none"}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, head_user_id: value === "none" ? null : value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department head" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {getAvailableUsers(users, departments, formData.head_user_id).map(user => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.head_user_id && selectedHeadUser && (
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Selected:</span> {selectedHeadUser.name} ({selectedHeadUser.email})
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_email">Contact Email</Label>
                  <Input
                    id="edit-contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact_number">Contact Number</Label>
                  <Input
                    id="edit-contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-logo">Department Logo</Label>
                  <Input
                    id="edit-logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  {formData.logo && (
                    <div className="mt-2">
                      <img
                        src={formData.logo}
                        alt="Department logo"
                        className="h-20 w-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
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

        {/* Delete Department Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Department</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <b>{selectedDepartment?.name}</b>? This action cannot be undone.
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
                onClick={handleDeleteDepartment}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Department Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Department Details</DialogTitle>
              <DialogDescription>
                View department information and details.
              </DialogDescription>
            </DialogHeader>
            {selectedDepartment && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                    {selectedDepartment.logo ? (
                      <img
                        src={selectedDepartment.logo}
                        alt="Department logo"
                        className="h-20 w-20 object-contain"
                      />
                    ) : (
                      <Building className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium leading-none">{selectedDepartment.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedDepartment.description}</div>
                  </div>
                </div>
                <div>
                  <Label>Contact</Label>
                  <div className="text-sm">{selectedDepartment.contact_email}</div>
                  <div className="text-sm">{selectedDepartment.contact_number}</div>
                </div>
                <div>
                  <Label>Head</Label>
                  <div className="text-sm">{selectedDepartment.head_name || 'Not assigned'}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="text-sm">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        selectedDepartment.is_active
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                          : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                      }`}
                    >
                      {selectedDepartment.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <div className="text-sm">{selectedDepartment.created_at ? format(new Date(selectedDepartment.created_at), 'PP p') : 'N/A'}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DepartmentManagement; 