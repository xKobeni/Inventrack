import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import useManageUserStore from "../../store/useManageUserStore";
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardHeader className="space-y-1 border-b bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserPlus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">Add New User</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Create a new user account with specific role and permissions.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-8 md:col-span-2">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-primary" />
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`h-11 ${errors.name ? "border-red-500" : ""}`}
                          placeholder="Enter user's full name"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                          placeholder="Enter user's email address"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-base font-medium flex items-center gap-2">
                          <Key className="h-4 w-4 text-primary" />
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`h-11 pr-10 ${errors.password ? "border-red-500" : ""}`}
                            placeholder="Enter initial password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.password}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid gap-2">
                        <Label htmlFor="role" className="text-base font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Role
                        </Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => {
                            setFormData((prev) => ({ ...prev, role: value }));
                            if (errors.role) {
                              setErrors((prev) => ({ ...prev, role: "" }));
                            }
                          }}
                        >
                          <SelectTrigger className={`h-11 ${errors.role ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="department_rep">Department Rep</SelectItem>
                            <SelectItem value="gso_staff">GSO Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.role && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50/50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      Please ensure all information is correct before creating the user account.
                    </AlertDescription>
                  </Alert>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t bg-muted/50 rounded-b-2xl px-8 py-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
                  className="h-11 min-w-[110px]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="h-11 min-w-[130px] font-semibold"
                >
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 