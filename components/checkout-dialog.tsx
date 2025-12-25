"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Wallet, CheckCircle2 } from "lucide-react"
import type { FoodItem } from "./food-item-card"

interface CartItem {
  item: FoodItem
  quantity: number
}

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  totalAmount: number
  onOrderComplete: () => void
  userEmail: string
}

type PaymentOption = "half-gcash" | "full-gcash"

export function CheckoutDialog({
  open,
  onOpenChange,
  cart,
  totalAmount,
  onOrderComplete,
  userEmail,
}: CheckoutDialogProps) {
  const [step, setStep] = useState<"payment" | "gcash-details" | "success">("payment")
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("half-gcash")
  const [isProcessing, setIsProcessing] = useState(false)

  const halfAmount = totalAmount / 2
  const amountToPay = paymentOption === "half-gcash" ? halfAmount : totalAmount

  const handlePaymentSelection = () => {
    setStep("gcash-details")
  }

  const handleGCashSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setStep("success")
    }, 2000)
  }

  const handleClose = () => {
    if (step === "success") {
      onOrderComplete()
      // Reset dialog state
      setTimeout(() => {
        setStep("payment")
        setPaymentOption("half-gcash")
      }, 300)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Choose Payment Method</DialogTitle>
              <DialogDescription>Select how you would like to pay for your order</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₱{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <RadioGroup value={paymentOption} onValueChange={(value) => setPaymentOption(value as PaymentOption)}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="half-gcash" id="half-gcash" className="mt-1" />
                    <Label htmlFor="half-gcash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Half Payment via GCash</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Pay 50% now via GCash, and the remaining 50% in cash when your food is delivered
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pay now (GCash):</span>
                          <span className="font-semibold text-primary">₱{halfAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pay on delivery (Cash):</span>
                          <span className="font-semibold">₱{halfAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="full-gcash" id="full-gcash" className="mt-1" />
                    <Label htmlFor="full-gcash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Full Payment via GCash</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Pay the full amount now via GCash</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pay now (GCash):</span>
                        <span className="font-semibold text-primary">₱{totalAmount.toFixed(2)}</span>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <Button className="w-full h-12" onClick={handlePaymentSelection}>
                Continue to Payment
              </Button>
            </div>
          </>
        )}

        {step === "gcash-details" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">GCash Payment Details</DialogTitle>
              <DialogDescription>
                {paymentOption === "half-gcash"
                  ? `Pay ₱${halfAmount.toFixed(2)} now (50% of total)`
                  : `Pay ₱${totalAmount.toFixed(2)} (Full amount)`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGCashSubmit} className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold">Amount to Pay via GCash</p>
                <p className="text-3xl font-bold text-primary">₱{amountToPay.toFixed(2)}</p>
                {paymentOption === "half-gcash" && (
                  <p className="text-xs text-muted-foreground">
                    Remaining ₱{halfAmount.toFixed(2)} to be paid in cash on delivery
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gcash-number">GCash Mobile Number</Label>
                  <Input
                    id="gcash-number"
                    name="gcash-number"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    pattern="[0-9]{11}"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcash-name">Account Name</Label>
                  <Input id="gcash-name" name="gcash-name" type="text" placeholder="Juan Dela Cruz" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-address">Delivery Address</Label>
                  <Textarea
                    id="delivery-address"
                    name="delivery-address"
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special requests or instructions for your order?"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setStep("payment")}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Confirm & Pay"}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <DialogTitle className="text-2xl text-center">Order Placed Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                Your order has been received and is being processed
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-semibold">₱{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid via GCash</span>
                  <span className="font-semibold text-green-600">₱{amountToPay.toFixed(2)}</span>
                </div>
                {paymentOption === "half-gcash" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cash on Delivery</span>
                    <span className="font-semibold text-orange-600">₱{halfAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-center text-balance">
                  {paymentOption === "half-gcash"
                    ? "Your order will be prepared and delivered soon. Please have the remaining amount ready in cash."
                    : "Your order is fully paid and will be prepared for delivery."}
                </p>
              </div>

              <Button className="w-full h-12" onClick={handleClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
