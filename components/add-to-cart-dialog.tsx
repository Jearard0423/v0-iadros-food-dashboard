"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Minus, Plus } from "lucide-react"
import Image from "next/image"
import type { FoodItem } from "./food-item-card"

interface AddToCartDialogProps {
  item: FoodItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (item: FoodItem, quantity: number) => void
}

export function AddToCartDialog({ item, open, onOpenChange, onConfirm }: AddToCartDialogProps) {
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)))
  }

  const handleConfirm = () => {
    if (item) {
      onConfirm(item, quantity)
      setQuantity(1)
      onOpenChange(false)
    }
  }

  if (!item) return null

  const totalPrice = item.price * quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-balance">Add to Cart</DialogTitle>
          <DialogDescription>Select the quantity for your order</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Food Item Display */}
          <div className="flex gap-4">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-balance leading-tight">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              <p className="text-lg font-bold text-primary mt-2">₱{item.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold">{quantity}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <span className="font-semibold text-lg">Total Price</span>
            <span className="text-2xl font-bold text-primary">₱{totalPrice.toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={handleConfirm}>
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
