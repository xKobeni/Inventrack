import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, Save, Plus } from "lucide-react";

export default function AddItem() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addItem } = useInventoryStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    quantity: "",
    unit: "",
    condition: "new",
    status: "available",
    expiration_date: null,
    acquisition_date: null,
    unit_cost: "",
    location: "",
    serial_number: "",
    property_number: "",
    department_id: ""
  });

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const requiredFields = ['name', 'category_id', 'quantity', 'unit', 'department_id'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Missing required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Convert string values to appropriate types
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        category_id: parseInt(formData.category_id),
        department_id: parseInt(formData.department_id),
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        acquisition_date: formData.acquisition_date ? formData.acquisition_date.toISOString().split('T')[0] : null,
        expiration_date: formData.expiration_date ? formData.expiration_date.toISOString().split('T')[0] : null,
      };

      await addItem(submitData);
      
      toast({
        title: "Success",
        description: "Item added successfully",
        variant: "success",
      });
      
      navigate("/admin/inventory");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/inventory">Inventory Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Add Item</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/admin/inventory")}
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl">Add New Inventory Item</CardTitle>
                    <CardDescription>
                      Create a new inventory item with all necessary details. Required fields are marked with an asterisk (*).
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
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
                        value={formData.name}
                        onChange={handleInputChange}
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
                        value={formData.category_id}
                        onValueChange={(value) => handleSelectChange('category_id', value)}
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
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter item description"
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department_id" className="text-sm font-medium">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.department_id}
                        onValueChange={(value) => handleSelectChange('department_id', value)}
                      >
                        <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
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
                        value={formData.quantity}
                        onChange={handleInputChange}
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
                        value={formData.unit}
                        onChange={handleInputChange}
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
                          value={formData.unit_cost}
                          onChange={handleInputChange}
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
                        value={formData.condition}
                        onValueChange={(value) => handleSelectChange('condition', value)}
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
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange('status', value)}
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
                        value={formData.location}
                        onChange={handleInputChange}
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
                        date={formData.acquisition_date}
                        onDateChange={(date) => handleDateChange('acquisition_date', date)}
                        placeholder="Select acquisition date"
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Expiration Date
                      </Label>
                      <DatePicker
                        date={formData.expiration_date}
                        onDateChange={(date) => handleDateChange('expiration_date', date)}
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
                        value={formData.serial_number}
                        onChange={handleInputChange}
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
                        value={formData.property_number}
                        onChange={handleInputChange}
                        placeholder="Enter property number"
                        className="focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/inventory")}
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
                        Adding...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 