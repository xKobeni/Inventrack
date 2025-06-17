import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import useUserStore from "../../store/useUserStore";
import useUserSessionStore from "../../store/useUserSessionStore";
import useUserPreferencesStore from "../../store/useUserPreferencesStore";
import { useToast } from "../../hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Mail, Phone, Building, Calendar, Shield, Bell, Lock, User, Settings, LogOut } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { updateProfile, changePassword, updateProfilePicture } = useUserStore();
  const { sessions: userSessions, loading: sessionsLoading, error: sessionsError, fetchSessions, logoutSession } = useUserSessionStore();
  const { preferences, getPreferences, updatePreferences, isLoading: preferencesLoading, error: preferencesError } = useUserPreferencesStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Initialize form data with user info
    setFormData(prev => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department_name || user?.department || "",
    }));

    // Fetch user preferences
    const loadPreferences = async () => {
      try {
        await getPreferences();
      } catch (err) {
        // Only show error toast if it's not an authentication error
        if (!err.message.includes('not authenticated')) {
          toast({
            title: "Error",
            description: err.message || "Failed to load preferences. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    // Fetch user sessions
    const loadSessions = async () => {
      try {
        await fetchSessions();
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to load sessions. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadPreferences();
    loadSessions();
  }, [isAuthenticated, user, navigate, fetchSessions, getPreferences, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = async (name, value) => {
    try {
      const updatedPreferences = {
        ...preferences,
        notification_settings: {
          ...preferences?.notification_settings,
          [name]: value
        }
      };
      
      await updatePreferences(updatedPreferences);
      
      toast({
        title: "Success!",
        description: "Preferences updated successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences.",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
      });

      // Update the auth store with new user data while preserving the token
      const currentState = useAuthStore.getState();
      useAuthStore.getState().setUser({
        ...response.data.user,
        token: currentState.token
      });

      // Update formData with the new user info
      setFormData(prev => ({
        ...prev,
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        department: response.data.user.department,
      }));

      toast({
        title: "Success!",
        description: "Profile updated successfully.",
        variant: "success",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast({
        title: "Success!",
        description: "Password changed successfully.",
        variant: "success",
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must not exceed 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPEG, PNG, and GIF images are allowed",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result?.toString() || '');
      setShowPreviewModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewSave = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      const response = await updateProfilePicture(selectedFile);
      // Update the auth store with new user data while preserving the token
      const currentState = useAuthStore.getState();
      useAuthStore.getState().setUser({
        ...response.data.user,
        token: currentState.token
      });
      toast({
        title: "Success!",
        description: "Profile picture updated successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile picture.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setShowPreviewModal(false);
      setImageSrc('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to format role display
  const formatRole = (role) => {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const handleLogoutSession = async () => {
    try {
      await logoutSession();
      toast({
        title: "Session Logged Out",
        description: "Current session has been logged out successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout session.",
        variant: "destructive",
      });
    }
  };

  const handleThemeChange = async (value) => {
    try {
      const updatedPreferences = {
        ...preferences,
        theme: value
      };
      
      await updatePreferences(updatedPreferences);
      
      toast({
        title: "Success!",
        description: "Theme updated successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update theme.",
        variant: "destructive",
      });
    }
  };

  const handleLanguageChange = async (value) => {
    try {
      const updatedPreferences = {
        ...preferences,
        language: value
      };
      
      await updatePreferences(updatedPreferences);
      
      toast({
        title: "Success!",
        description: "Language updated successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update language.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header Section */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 pt-6 md:p-8">
          <div className="mx-auto max-w-5xl flex flex-col gap-8">
            {/* Top Section: Profile Summary + Profile Forms in one card */}
            <Card className="overflow-visible">
              <div className="flex flex-col md:flex-row gap-8 p-6">
                {/* Profile Summary (Left) */}
                <div className="w-full md:w-80 flex-shrink-0 flex flex-col items-center md:items-start">
                  <div className="relative group">
                    <div 
                      className="relative cursor-pointer"
                      onClick={handleProfilePictureClick}
                    >
                      <Avatar className="h-24 w-24 border-2 border-primary/20 mb-4">
                        <AvatarImage src={user?.profile_picture} alt={user?.name} />
                        <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">Change Photo</span>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                  <h1 className="text-xl font-bold text-center md:text-left mb-1">{user?.name}</h1>
                  <div className="flex flex-col items-center md:items-start gap-1 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{user?.department_name || user?.department || 'Not assigned'}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2">{formatRole(user?.role)}</Badge>
                </div>
                  
                {/* Profile Forms/Tabs (Right) */}
                <div className="flex-1 w-full">
                  <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-4">
                      <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger value="preferences" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Preferences
                      </TabsTrigger>
                    </TabsList>
                    <div className="grid gap-6">
                      {/* Profile Tab */}
                      <TabsContent value="profile">
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                  <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="pl-9"
                                  />
                                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                  <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="pl-9"
                                  />
                                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                  <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="pl-9"
                                  />
                                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <div className="relative">
                                  <Input
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    disabled
                                    readOnly
                                    className="pl-9"
                                  />
                                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-4">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="outline"
                                  type="button"
                                  onClick={() => setIsEditing(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  onClick={handleProfileUpdate}
                                >
                                  Save Changes
                                </Button>
                              </>
                            ) : (
                              <Button type="button" onClick={() => setIsEditing(true)}>
                                Edit Profile
                              </Button>
                            )}
                          </div>
                        </form>
                      </TabsContent>
                      {/* Security Tab */}
                      <TabsContent value="security">
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                          <div className="grid gap-6">
                            <div className="space-y-4">
                              <div className="grid gap-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                  <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showPasswords.current ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className="pl-9 pr-9"
                                  />
                                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  className="text-xs text-primary hover:underline mt-1 text-left"
                                  onClick={() => navigate('/forgot-password')}
                                >
                                  Forgot Password?
                                </button>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                  <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPasswords.new ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="pl-9 pr-9"
                                  />
                                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                  <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="pl-9 pr-9"
                                  />
                                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end pt-2">
                            <Button type="submit">
                              Update Password
                            </Button>
                          </div>
                        </form>
                      </TabsContent>
                      {/* Preferences Tab */}
                      <TabsContent value="preferences">
                        <div className="space-y-6">
                          {preferencesError ? (
                            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
                              {preferencesError}
                            </div>
                          ) : (
                            <>
                              {/* Theme Selection */}
                              <div className="space-y-4">
                                <div className="grid gap-2">
                                  <Label>Theme</Label>
                                  <Select
                                    value={preferences?.theme || 'light'}
                                    onValueChange={handleThemeChange}
                                    disabled={preferencesLoading}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="light">Light</SelectItem>
                                      <SelectItem value="dark">Dark</SelectItem>
                                      <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-sm text-muted-foreground">
                                    Choose your preferred theme for the application
                                  </p>
                                </div>
                              </div>

                              <Separator />

                              {/* Language Selection */}
                              <div className="space-y-4">
                                <div className="grid gap-2">
                                  <Label>Language</Label>
                                  <Select
                                    value={preferences?.language || 'en'}
                                    onValueChange={handleLanguageChange}
                                    disabled={preferencesLoading}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="en">English</SelectItem>
                                      <SelectItem value="es">Español</SelectItem>
                                      <SelectItem value="fr">Français</SelectItem>
                                      <SelectItem value="de">Deutsch</SelectItem>
                                      <SelectItem value="ja">日本語</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-sm text-muted-foreground">
                                    Choose your preferred language for the application
                                  </p>
                                </div>
                              </div>

                              <Separator />

                              {/* Notification Settings */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Receive email notifications for important updates
                                    </p>
                                  </div>
                                  <Switch
                                    checked={preferences?.notification_settings?.email ?? true}
                                    onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
                                    disabled={preferencesLoading}
                                  />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Receive push notifications for important updates
                                    </p>
                                  </div>
                                  <Switch
                                    checked={preferences?.notification_settings?.push ?? true}
                                    onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
                                    disabled={preferencesLoading}
                                  />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <Label>Security Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Get notified about security-related activities
                                    </p>
                                  </div>
                                  <Switch
                                    checked={preferences?.notification_settings?.security ?? true}
                                    onCheckedChange={(checked) => handlePreferenceChange('security', checked)}
                                    disabled={preferencesLoading}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </Card>
            {/* User Sessions Card */}
            <Card className="shadow-lg border border-muted-foreground/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">User Sessions</CardTitle>
                    <CardDescription>Manage your active sessions</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSessions()}
                    disabled={sessionsLoading}
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[420px] text-sm">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead className="py-3 px-4">Platform</TableHead>
                        <TableHead className="py-3 px-4">Browser</TableHead>
                        <TableHead className="py-3 px-4">Location</TableHead>
                        <TableHead className="py-3 px-4">Last Active</TableHead>
                        <TableHead className="py-3 px-4 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Loading sessions...
                          </TableCell>
                        </TableRow>
                      ) : sessionsError ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-destructive">
                            {sessionsError}
                          </TableCell>
                        </TableRow>
                      ) : userSessions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No active sessions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        userSessions.map((session) => {
                          console.log('Rendering session:', session); // Debug log
                          return (
                            <TableRow 
                              key={session.id} 
                              className={`${session.current ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"} transition-colors`}
                            >
                              <TableCell className="py-2 px-4 align-middle">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{session.platform}</span>
                                  {session.current && (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                      Current Session
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-2 px-4 align-middle">
                                <span>{session.browser}</span>
                              </TableCell>
                              <TableCell className="py-2 px-4 align-middle">
                                <div className="flex flex-col">
                                  <span>{session.location}</span>
                                  <span className="text-xs text-muted-foreground">{session.region}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 px-4 align-middle">
                                <div className="flex items-center gap-2">
                                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary/60"></div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium text-sm">{session.lastActive.date}</span>
                                      <span className="text-xs text-muted-foreground">at</span>
                                      <span className="text-sm">{session.lastActive.time}</span>
                                    </div>
                                    {session.lastActive.relative && (
                                      <span className="text-xs text-primary font-medium mt-0.5">
                                        {session.lastActive.relative}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 px-4 align-middle text-right">
                                {!session.current && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleLogoutSession}
                                    title="Logout this session"
                                    className="hover:bg-destructive/10"
                                  >
                                    <LogOut className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Image Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-[90%] max-w-md">
              <CardHeader>
                <CardTitle>Preview Profile Picture</CardTitle>
                <CardDescription>This is how your profile picture will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <img src={imageSrc} alt="Profile Preview" className="max-h-64 max-w-full rounded-full border" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setImageSrc('');
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePreviewSave}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Save'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
