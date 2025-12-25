"use client"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import type { FoodItem } from "./food-item-card"

interface CartItem {
  item: FoodItem
  quantity: number
}

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  onUpdateQuantity: (itemId: string, newQuantity: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
}

export function CartSheet({ open, onOpenChange, cart, onUpdateQuantity, onRemoveItem, onCheckout }: CartSheetProps) {
  const subtotal = cart.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0)
  const totalItems = cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-4 sm:p-6 pb-4">
          <SheetTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            Your Cart
          </SheetTitle>
          <SheetDescription className="text-sm">
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems > 1 ? "s" : ""} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-3">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-base sm:text-lg">No items in cart yet</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Start adding delicious items!</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4 sm:px-6">
              <div className="space-y-4 pb-4">
                {cart.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex gap-3 sm:gap-4 py-4 border-b border-border last:border-0">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={cartItem.item.image || "/placeholder.svg"}
                        alt={cartItem.item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-semibold text-balance leading-tight text-sm sm:text-base">
                          {cartItem.item.name}
                        </h4>
                        <p className="text-xs sm:text-sm font-bold text-primary mt-1">
                          ₱{cartItem.item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent"
                          onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                          disabled={cartItem.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center font-semibold text-sm">{cartItem.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent"
                          onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          disabled={cartItem.quantity >= 99}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 ml-auto text-destructive hover:text-destructive"
                          onClick={() => onRemoveItem(cartItem.item.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-sm sm:text-base">
                      ₱{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4 sm:p-6 space-y-4 bg-muted/30">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base sm:text-lg">Total</span>
                  <span className="font-bold text-xl sm:text-2xl text-primary">₱{subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full h-11 sm:h-12 text-sm sm:text-base" onClick={onCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
