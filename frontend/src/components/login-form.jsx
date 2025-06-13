import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import useAuthStore from "../store/useAuthStore.js"
import { useToast } from "../hooks/use-toast.js"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm({
  className,
  ...props
}) {
  const { login, token, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      setIsRedirecting(true)
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, token, navigate, location.state?.from?.pathname])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      setIsLoading(true)
      setUnverifiedEmail(null)
      await login({ email, password })
      
      toast({
        title: "Success!",
        description: "You have been logged in successfully.",
        variant: "success",
      })

      // Set redirecting state
      setIsRedirecting(true)
      
      // Redirect to the attempted URL or dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login error details:', error);
      
      // Check if the error is due to unverified email
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        setUnverifiedEmail(error.response.data.email)
        toast({
          title: "Email Not Verified",
          description: "Please verify your email before logging in.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      
      {unverifiedEmail && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex flex-col gap-2">
            <p>Your email ({unverifiedEmail}) is not verified.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/verify-email', { state: { email: unverifiedEmail } })}
            >
              Request Verification Email
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              className="pl-9 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              required
              className="pl-9 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex items-center">
            <Checkbox id="remember-me" className="border-muted-foreground/25" />
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
        <Button 
          type="submit" 
          className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]" 
          disabled={isLoading || isRedirecting}
        >
          {isLoading ? "Logging in..." : isRedirecting ? "Redirecting..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
