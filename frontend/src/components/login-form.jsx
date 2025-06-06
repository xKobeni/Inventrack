import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import useAuthStore from "../store/useAuthStore.js"
import { useToast } from "../hooks/use-toast.js"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm({
  className,
  ...props
}) {
  const { login, user, token, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  // Debug: Check auth state on component mount
  useEffect(() => {
    console.log('Current auth state:', {
      user,
      token,
      isAuthenticated,
      localStorage: localStorage.getItem('auth-storage')
    });
  }, [user, token, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      setIsLoading(true)
      const response = await login({ email, password })
      
      // Debug: Log stored information after login
      console.log('After login - Auth state:', {
        user: response.user,
        token: response.token,
        localStorage: localStorage.getItem('auth-storage')
      });
      
      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
        variant: "success",
      })

      // Redirect to the attempted URL or dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error details:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex items-center">
            <Checkbox id="remember-me" />
            <label
              htmlFor="remember-me"
              className="pl-2 text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
            <a href="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
