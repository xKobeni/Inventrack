import { useState, useEffect } from "react";
import useCategoryStore from "../../store/useCategoryStore";
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
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

export default function CategoryManagement() {
  const { toast } = useToast();
  const { categories, isLoading, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: ""
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      await fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCategory(formData.name);
      toast({
        title: "Success",
        description: "Category added successfully",
        variant: "success",
      });
      setIsAddDialogOpen(false);
      setFormData({ name: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(editingCategory.category_id, formData.name);
      toast({
        title: "Success",
        description: "Category updated successfully",
        variant: "success",
      });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryToDelete.category_id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
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
                  <BreadcrumbPage>Category Management</BreadcrumbPage>
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
                  <CardTitle>Category Management</CardTitle>
                  <CardDescription>
                    Manage inventory item categories. Create, edit, and delete categories as needed.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={loadCategories} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Category Name</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.category_id}>
                          <TableCell>{category.category_id}</TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(category)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Category Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for inventory items.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName" className="text-sm font-medium">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter category name"
                  className="focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setFormData({ name: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category name.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName" className="text-sm font-medium">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editCategoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Enter category name"
                  className="focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <b>{categoryToDelete?.name}</b>? 
                This action cannot be undone. If this category is being used by inventory items, 
                the deletion will fail.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setCategoryToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
} 