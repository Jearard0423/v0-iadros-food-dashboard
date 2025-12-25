"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { auth, actionCodeSettings } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import { Mail, AlertCircle, Eye, EyeOff } from "lucide-react"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess: (user: { email: string; name: string }) => void
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const { toast } = useToast()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSignupSuccess(false)
      setEmailVerificationSent(false)
      setNewUserEmail("")
      setActiveTab("login")
      setShowLoginPassword(false)
      setShowSignupPassword(false)
      setIsResettingPassword(false)
      setResetEmail("")
    }
    onOpenChange(open)
  }

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("iadros_remember_email")
    if (rememberedEmail) {
      setNewUserEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("verified") === "true") {
        setActiveTab("login")
        toast({
          title: "Email verified!",
          description: "Your email has been verified. You can now login with your credentials.",
        })
        window.history.replaceState({}, "", window.location.pathname)
      }
    }
  }, [open, toast])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      console.log("[v0] Attempting login with email:", email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("[v0] Login successful for user:", user.email, "Verified:", user.emailVerified)

      if (!user.emailVerified) {
        await signOut(auth)
        toast({
          title: "Email not verified",
          description: "Please verify your email before logging in. Check your inbox for the verification link.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (rememberMe) {
        localStorage.setItem("iadros_remember_email", email)
      } else {
        localStorage.removeItem("iadros_remember_email")
      }

      console.log("[v0] User verified, logging in")
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })
      onAuthSuccess({
        email: user.email || email,
        name: user.displayName || email.split("@")[0],
      })
      handleOpenChange(false)
    } catch (error: any) {
      console.log("[v0] Login error:", error.code, error.message)
      let errorMessage = "Unable to sign in. Please check your email and password."
      let errorTitle = "Login failed"

      if (error.code === "auth/invalid-credential") {
        errorMessage =
          "The email or password you entered is incorrect. Please double-check your credentials and try again."
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address. Please sign up first."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again or reset your password."
      } else if (error.code === "auth/too-many-requests") {
        errorTitle = "Too many attempts"
        errorMessage = "Too many failed login attempts. Please try again later or reset your password."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled. Please contact support."
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Attempting signup with email:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("[v0] Signup successful for user:", user.email)

      await updateProfile(user, {
        displayName: name,
      })
      console.log("[v0] User profile updated with name:", name)

      try {
        await sendEmailVerification(user, actionCodeSettings)
        console.log("[v0] Email verification sent to:", user.email)
      } catch (emailError: any) {
        console.log("[v0] Email verification error (non-critical):", emailError.code, emailError.message)
      }

      await signOut(auth)
      console.log("[v0] User signed out, awaiting email verification")

      setSignupSuccess(true)
      setEmailVerificationSent(true)
      setNewUserEmail(email)
      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      console.log("[v0] Signup error:", error.code, error.message)

      if (error.code === "auth/email-already-in-use") {
        setActiveTab("login")
        setNewUserEmail(email)
        toast({
          title: "Email already registered",
          description:
            "This email is already in use. Please login with your existing account or use a different email.",
          variant: "destructive",
        })
      } else if (error.code === "auth/weak-password") {
        toast({
          title: "Weak password",
          description: "Password should be at least 6 characters with a mix of letters and numbers.",
          variant: "destructive",
        })
      } else if (error.code === "auth/invalid-email") {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signup failed",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      })
      return
    }

    setIsResettingPassword(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for instructions to reset your password.",
      })
      setResetEmail("")
      setIsResettingPassword(false)
    } catch (error: any) {
      console.error("[v0] Password reset error:", error)
      let errorMessage = "Failed to send password reset email. Please try again."
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      }
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      })
      setIsResettingPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-balance">Welcome to IADROS</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one to place orders.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  defaultValue={newUserEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword || !resetEmail}
                >
                  {isResettingPassword ? "Sending..." : "Forgot password?"}
                </Button>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="px-1 text-sm font-semibold"
                onClick={() => setActiveTab("signup")}
              >
                Sign up here
              </Button>
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Make sure you have verified your email before logging in. Check your inbox for the verification link.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            {signupSuccess ? (
              <div className="space-y-4 py-6 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                    <Mail className="h-16 w-16 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Account Created Successfully!
                  </h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">
                      📧 Verification Email Sent
                    </p>
                    <p className="text-xs text-orange-800 dark:text-orange-400">We've sent a verification link to:</p>
                    <p className="text-sm font-bold text-orange-900 dark:text-orange-300">{newUserEmail}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 rounded-lg p-4 space-y-2 text-left">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">📋 Next Steps:</p>
                    <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the verification link in the email</li>
                      <li>Return here and login with your credentials</li>
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    You must verify your email before you can login
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setActiveTab("login")
                    setSignupSuccess(false)
                    setEmailVerificationSent(false)
                  }}
                  className="mt-6 w-full"
                  size="lg"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="px-1 text-sm font-semibold"
                    onClick={() => setActiveTab("login")}
                  >
                    Login here
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
