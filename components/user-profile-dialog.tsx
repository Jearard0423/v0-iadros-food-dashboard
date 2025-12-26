"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar, ShieldCheck, LogOut, RefreshCw, X } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { SignOutConfirmationDialog } from "@/components/sign-out-confirmation-dialog"

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { email: string; name: string; photoURL?: string } | null
  onSignOut: () => Promise<void>
}

export function UserProfileDialog({ open, onOpenChange, user, onSignOut }: UserProfileDialogProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [provider, setProvider] = useState<string>("password")
  const { toast } = useToast()
  const firebaseUser = auth.currentUser

  useEffect(() => {
    if (open && firebaseUser) {
      setEmailVerified(firebaseUser.emailVerified)
      const providerData = firebaseUser.providerData[0]
      if (providerData) {
        setProvider(providerData.providerId)
      }
    }
  }, [open, firebaseUser])

  const handleRefreshStatus = async () => {
    if (!firebaseUser) return

    setIsRefreshing(true)
    try {
      await firebaseUser.reload()
      const updatedUser = auth.currentUser
      if (updatedUser) {
        setEmailVerified(updatedUser.emailVerified)
        if (updatedUser.emailVerified) {
          toast({
            title: "Email Verified!",
            description: "Your email has been successfully verified.",
          })
          window.location.reload()
        } else {
          toast({
            title: "Not verified yet",
            description: "Please check your email and click the verification link.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true)
  }

  const handleConfirmedSignOut = async () => {
    setIsSigningOut(true)
    try {
      await onSignOut()
      onOpenChange(false)
      setShowSignOutConfirm(false)
    } catch (error) {
      console.error("[v0] Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      setIsSigningOut(false)
      setShowSignOutConfirm(false)
    }
  }

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case "google.com":
        return "Google"
      case "facebook.com":
        return "Facebook"
      case "password":
        return "Email"
      default:
        return "Unknown"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">My Profile</DialogTitle>
                <DialogDescription>Your account information</DialogDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              {user?.photoURL ? (
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="rounded-full bg-primary/10 p-6">
                  <User className="h-16 w-16 text-primary" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{user?.name || "User"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                  <p className="font-medium text-sm break-all">{user?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Sign-in Method</p>
                  <p className="font-medium">{getProviderName(provider)}</p>
                </div>
              </div>

              {firebaseUser?.metadata?.creationTime && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                    <p className="font-medium">
                      {new Date(firebaseUser.metadata.creationTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {provider === "password" && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">Account Status</p>
                      {!emailVerified && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={handleRefreshStatus}
                          disabled={isRefreshing}
                        >
                          <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                    </div>
                    <p className="font-medium flex items-center gap-2">
                      {emailVerified ? (
                        <>
                          <span className="text-green-600">Verified</span>
                          <span className="h-2 w-2 rounded-full bg-green-600" />
                        </>
                      ) : (
                        <>
                          <span className="text-amber-600">Pending Verification</span>
                          <span className="h-2 w-2 rounded-full bg-amber-600" />
                        </>
                      )}
                    </p>
                    {!emailVerified && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Click the refresh icon after verifying your email
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSignOutClick}
              variant="destructive"
              className="w-full"
              size="lg"
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SignOutConfirmationDialog
        open={showSignOutConfirm}
        onOpenChange={setShowSignOutConfirm}
        onConfirm={handleConfirmedSignOut}
        isLoading={isSigningOut}
      />
    </>
  )
}
