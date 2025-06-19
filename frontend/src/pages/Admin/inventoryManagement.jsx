import { useState, useEffect } from "react";
import useInventoryStore from "../../store/useInventoryStore";
import useDepartmentStore from "../../store/useDepartmentStore";
import useCategoryStore from "../../store/useCategoryStore";
import { useToast } from "../../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
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
import { MoreHorizontal, Search, Plus, Pencil, Trash2, Download, RefreshCw, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { exportToCSV } from '../../utils/exports';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function InventoryManagement() {
  const { toast } = useToast();
  const {
    items,
    isLoading,
    pagination,
    fetchItems,
    deleteItem,
    updateItem,
  } = useInventoryStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { categories, fetchCategories } = useCategoryStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    quantity: "",
    unit: "",
    condition: "",
    status: "",
    expiration_date: null,
    acquisition_date: null,
    unit_cost: "",
    location: "",
    serial_number: "",
    property_number: "",
    department_id: ""
  });
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [itemToView, setItemToView] = useState(null);

  useEffect(() => {
    loadItems();
    fetchDepartments();
    fetchCategories();
  }, [currentPage, categoryFilter, statusFilter, pageSize, sortBy, sortOrder]);

  const loadItems = async () => {
    try {
      await fetchItems({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load inventory items",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadItems();
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteItem(itemId);
      toast({
        title: "Success",
        description: "Item deleted successfully",
        variant: "success",
      });
      loadItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      description: item.description || "",
      category_id: item.category_id ? String(item.category_id) : "",
      quantity: item.quantity,
      unit: item.unit,
      condition: item.condition || "",
      status: item.status || "",
      expiration_date: item.expiration_date ? new Date(item.expiration_date) : null,
      acquisition_date: item.acquisition_date ? new Date(item.acquisition_date) : null,
      unit_cost: item.unit_cost || "",
      location: item.location || "",
      serial_number: item.serial_number || "",
      property_number: item.property_number || "",
      department_id: item.department_id ? String(item.department_id) : ""
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

  const handleEditDateChange = (name, date) => {
    setEditFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert date objects to ISO strings for backend, omit if not set
      const submitData = { ...editFormData };
      if (editFormData.acquisition_date) {
        submitData.acquisition_date = editFormData.acquisition_date.toISOString().split('T')[0];
      } else {
        delete submitData.acquisition_date;
      }
      if (editFormData.expiration_date) {
        submitData.expiration_date = editFormData.expiration_date.toISOString().split('T')[0];
      } else {
        delete submitData.expiration_date;
      }

      await updateItem(editingItem.item_id, submitData);
      toast({
        title: "Success",
        description: "Item updated successfully",
        variant: "success",
      });
      setIsEditDialogOpen(false);
      loadItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleViewClick = (item) => {
    setItemToView(item);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PP');
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
                  <BreadcrumbPage>Inventory Management</BreadcrumbPage>
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
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Manage inventory items, their quantities, and status.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={loadItems} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => exportToCSV(items)} title="Export CSV">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/admin/categories")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Categories
                  </Button>
                  <Button onClick={() => navigate("/admin/inventory/add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
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
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </form>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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

                {/* Items Table */}
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                          Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('category_id')}>
                          Category {sortBy === 'category_id' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('quantity')}>
                          Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                          Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('department_name')}>
                          Department {sortBy === 'department_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </TableHead>
                        <TableHead className="cursor-pointer select-none" onClick={() => handleSort('expiration_date')}>
                          Expiration {sortBy === 'expiration_date' && (sortOrder === 'asc' ? '▲' : '▼')}
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
                      ) : items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No items found
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item) => (
                          <TableRow key={item.item_id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.category_name || (categories.find(c => c.category_id === item.category_id)?.name) || 'N/A'}</TableCell>
                            <TableCell>{item.quantity} {item.unit}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                  item.status === 'available'
                                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                    : item.status === 'low_stock'
                                    ? "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                }`}
                              >
                                {item.status === 'available' ? 'Available' : 
                                 item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </TableCell>
                            <TableCell>{item.department_name || 'Not assigned'}</TableCell>
                            <TableCell>{formatDate(item.expiration_date)}</TableCell>
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
                                  <DropdownMenuItem onClick={() => handleViewClick(item)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" /> View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(item)}>
                                    <Pencil className="h-4 w-4 mr-2 text-muted-foreground" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(item)}
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
                    Showing {items.length} of {pagination.totalItems} items
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update the item's information. Required fields are marked with an asterisk (*).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      placeholder="Enter item name"
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category_id" className="text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={editFormData.category_id}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, category_id: value }))
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      placeholder="Enter item description"
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department_id" className="text-sm font-medium">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={editFormData.department_id ? String(editFormData.department_id) : "none"}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, department_id: value === "none" ? null : value }))
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
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
              </div>

              {/* Quantity and Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quantity & Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium">
                      Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      value={editFormData.quantity}
                      onChange={handleEditInputChange}
                      placeholder="0"
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm font-medium">
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={editFormData.unit}
                      onChange={handleEditInputChange}
                      placeholder="e.g., pieces, boxes"
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_cost" className="text-sm font-medium">
                      Unit Cost
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="unit_cost"
                        name="unit_cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editFormData.unit_cost}
                        onChange={handleEditInputChange}
                        placeholder="0.00"
                        className="pl-8 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-sm font-medium">
                      Condition
                    </Label>
                    <Select
                      value={editFormData.condition}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, condition: value }))
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Status
                    </Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="disposed">Disposed</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditInputChange}
                      placeholder="e.g., Storage Room 101"
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Important Dates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Acquisition Date
                    </Label>
                    <DatePicker
                      date={editFormData.acquisition_date}
                      onDateChange={(date) => handleEditDateChange('acquisition_date', date)}
                      placeholder="Select acquisition date"
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Expiration Date
                    </Label>
                    <DatePicker
                      date={editFormData.expiration_date}
                      onDateChange={(date) => handleEditDateChange('expiration_date', date)}
                      placeholder="Select expiration date"
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Identification Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Identification</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serial_number" className="text-sm font-medium">
                      Serial Number
                    </Label>
                    <Input
                      id="serial_number"
                      name="serial_number"
                      value={editFormData.serial_number}
                      onChange={handleEditInputChange}
                      placeholder="Enter serial number"
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_number" className="text-sm font-medium">
                      Property Number
                    </Label>
                    <Input
                      id="property_number"
                      name="property_number"
                      value={editFormData.property_number}
                      onChange={handleEditInputChange}
                      placeholder="Enter property number"
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-6 border-t">
                <div className="flex gap-3 w-full justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <b>{itemToDelete?.name}</b>? This action cannot be undone.
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
                  if (itemToDelete) {
                    await handleDelete(itemToDelete.item_id);
                    setIsDeleteDialogOpen(false);
                    setItemToDelete(null);
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
              {/* Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-90"></div>
                <div className="relative flex flex-col items-center justify-center py-8 px-6">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-700 shadow-lg overflow-hidden border-4 border-white">
                    {itemToView?.category?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="mt-4 text-xl font-semibold text-white">{itemToView?.name}</div>
                  <div className="text-sm text-blue-100">{itemToView?.category}</div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      itemToView?.status === 'available'
                        ? "bg-green-100 text-green-800"
                        : itemToView?.status === 'low_stock'
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {itemToView?.status === 'available' ? 'Available' : 
                       itemToView?.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs text-gray-500">Description</span>
                        <span className="font-medium">{itemToView?.description || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Quantity</span>
                        <span className="font-medium">{itemToView?.quantity} {itemToView?.unit}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Condition</span>
                        <span className="font-medium capitalize">{itemToView?.condition || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Additional Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs text-gray-500">Department</span>
                        <span className="font-medium">{itemToView?.department_name || 'Not assigned'}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Expiration Date</span>
                        <span className="font-medium">{formatDate(itemToView?.expiration_date)}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Created By</span>
                        <span className="font-medium">{itemToView?.created_by_name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleEdit(itemToView);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Item
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleDeleteClick(itemToView);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Item
                    </Button>
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
