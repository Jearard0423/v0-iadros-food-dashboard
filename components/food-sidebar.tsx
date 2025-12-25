"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChefHat, Drumstick, UtensilsCrossed, Cake, Sparkles, ShoppingCart, Menu, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export type MenuCategory = "all" | "main-dishes" | "chicken-wings" | "spaghetti-noodles" | "desserts" | "best-sellers"

interface FoodSidebarProps {
  activeCategory: MenuCategory
  onCategoryChange: (category: MenuCategory) => void
  cartItemCount?: number
  onCartClick?: () => void
  onOrderClick?: () => void
}

const categories = [
  { id: "all" as MenuCategory, label: "All Items", icon: UtensilsCrossed },
  { id: "main-dishes" as MenuCategory, label: "Main Dishes", icon: ChefHat },
  { id: "chicken-wings" as MenuCategory, label: "Chicken & Wings", icon: Drumstick },
  { id: "spaghetti-noodles" as MenuCategory, label: "Spaghetti & Noodles", icon: UtensilsCrossed },
  { id: "desserts" as MenuCategory, label: "Desserts", icon: Cake },
  { id: "best-sellers" as MenuCategory, label: "Best Sellers", icon: Sparkles },
]

export function FoodSidebar({
  activeCategory,
  onCategoryChange,
  cartItemCount = 0,
  onCartClick,
  onOrderClick,
}: FoodSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <div className="relative w-full h-20 sm:h-24 mb-3 sm:mb-4">
          <Image src="/images/iadros-logo.png" alt="IADROS Food Services" fill className="object-contain" priority />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-sidebar-foreground text-balance">IADROS Food Services</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{"Delicious meals served by the tray"}</p>
      </div>

      <ScrollArea className="flex-1 px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground px-3 mb-3">MENU CATEGORIES</p>
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10 sm:h-11 text-sm",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                onClick={() => {
                  onCategoryChange(category.id)
                  setIsMobileOpen(false)
                }}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{category.label}</span>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-3 sm:p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="outline"
          className="w-full gap-2 bg-transparent h-10 text-sm"
          onClick={() => {
            onCartClick?.()
            setIsMobileOpen(false)
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>View Cart</span>
          {cartItemCount > 0 && (
            <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
              {cartItemCount}
            </span>
          )}
        </Button>
        <Button
          className="w-full h-10 text-sm"
          onClick={() => {
            onOrderClick?.()
            setIsMobileOpen(false)
          }}
        >
          Order Now
        </Button>
      </div>
    </>
  )

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 sm:w-72 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300 lg:hidden flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
