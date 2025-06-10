import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import useManageUserStore from "../../store/useManageUserStore";
import useDepartmentStore from "../../store/useDepartmentStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, UserPlus, Shield, Mail, Key } from "lucide-react";

export default function AddUser() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addUser, isLoading } = useManageUserStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department_id: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await addUser(formData);

      toast({
        title: "Success",
        description: "User created successfully",
        variant: "success",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        department_id: null
      });
      setErrors({});

      // Navigate back to user management
      navigate("/admin/users");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                  <BreadcrumbLink href="/admin/users">User Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Add User</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-muted/30">
          <div className="w-full max-w-4xl">
            <Card className="shadow-2xl border border-gray-200 rounded-3xl bg-white/95">
              <CardHeader className="space-y-1 border-b bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-3xl px-10 py-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Add New User</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Create a new user account with specific role and permissions.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-10 pb-4 px-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">User Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Name */}
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={errors.name ? "border-red-500" : ""}
                          placeholder="Enter user's full name"
                        />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                      </div>
                      {/* Email */}
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={errors.email ? "border-red-500" : ""}
                          placeholder="Enter user's email address"
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                      </div>
                      {/* Password */}
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                            placeholder="Enter user's password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">At least 6 characters.</p>
                        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                      </div>
                      {/* Role */}
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={value => setFormData(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="department_rep">Department Rep</SelectItem>
                            <SelectItem value="gso_staff">GSO Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                      </div>
                      {/* Department */}
                      <div className="md:col-span-2">
                        <Label htmlFor="department_id">Department</Label>
                        <Select
                          value={formData.department_id ? String(formData.department_id) : "none"}
                          onValueChange={value => setFormData(prev => ({ ...prev, department_id: value === "none" ? null : value }))}
                        >
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
                  </div>
                  <div className="border-t pt-6 pb-4 flex justify-end gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/users")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 