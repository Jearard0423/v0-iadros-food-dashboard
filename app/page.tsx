"use client"

import { useState, useEffect } from "react"
import { FoodSidebar, type MenuCategory } from "@/components/food-sidebar"
import { FoodItemCard, type FoodItem } from "@/components/food-item-card"
import { AuthDialog } from "@/components/auth-dialog"
import { AddToCartDialog } from "@/components/add-to-cart-dialog"
import { CartSheet } from "@/components/cart-sheet"
import { CheckoutDialog } from "@/components/checkout-dialog"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import { SignOutConfirmationDialog } from "@/components/sign-out-confirmation-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, User, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  saveCartToFirestore,
  loadCartFromFirestore,
  clearCartFromFirestore,
  type CartItem as FirestoreCartItem,
} from "@/lib/cart-service"

// Sample menu data
const menuItems: FoodItem[] = [
  {
    id: "1",
    name: "Grilled Chicken with Rice",
    description: "Tender grilled chicken served with steamed rice and vegetables",
    price: 120,
    image: "/grilled-chicken-rice-meal.jpg",
    category: "main-dishes",
    isBestSeller: true,
  },
  {
    id: "2",
    name: "Beef Tapa",
    description: "Marinated beef tapa with garlic rice and sunny-side-up egg",
    price: 135,
    image: "/beef-tapa-filipino-meal.jpg",
    category: "main-dishes",
    isBestSeller: true,
  },
  {
    id: "3",
    name: "Crispy Fried Chicken",
    description: "Golden crispy fried chicken with special seasoning",
    price: 95,
    image: "/crispy-fried-chicken.png",
    category: "chicken-wings",
    isBestSeller: true,
  },
  {
    id: "4",
    name: "Buffalo Wings (6pcs)",
    description: "Spicy buffalo wings with ranch dipping sauce",
    price: 110,
    image: "/buffalo-chicken-wings.png",
    category: "chicken-wings",
  },
  {
    id: "5",
    name: "Carbonara",
    description: "Creamy carbonara pasta with bacon and parmesan",
    price: 85,
    image: "/classic-carbonara.png",
    category: "spaghetti-noodles",
  },
  {
    id: "6",
    name: "Filipino Spaghetti",
    description: "Sweet-style spaghetti with hotdog and cheese",
    price: 75,
    image: "/filipino-sweet-spaghetti.jpg",
    category: "spaghetti-noodles",
    isBestSeller: true,
  },
  {
    id: "7",
    name: "Pancit Canton",
    description: "Stir-fried noodles with vegetables and chicken",
    price: 70,
    image: "/pancit-canton-filipino-noodles.jpg",
    category: "spaghetti-noodles",
  },
  {
    id: "8",
    name: "Leche Flan",
    description: "Traditional Filipino caramel custard dessert",
    price: 45,
    image: "/leche-flan-dessert.jpg",
    category: "desserts",
  },
  {
    id: "9",
    name: "Halo-Halo",
    description: "Mixed shaved ice with sweet beans, fruits, and ube ice cream",
    price: 65,
    image: "/halo-halo-filipino-dessert.jpg",
    category: "desserts",
    isBestSeller: true,
  },
  {
    id: "10",
    name: "Ube Cake Slice",
    description: "Purple yam cake with cream cheese frosting",
    price: 55,
    image: "/ube-purple-yam-cake.jpg",
    category: "desserts",
  },
  {
    id: "11",
    name: "Pork Adobo",
    description: "Classic Filipino braised pork in soy sauce and vinegar",
    price: 115,
    image: "/pork-adobo-filipino.jpg",
    category: "main-dishes",
  },
  {
    id: "12",
    name: "Honey Garlic Wings (6pcs)",
    description: "Sweet and savory wings glazed with honey garlic sauce",
    price: 115,
    image: "/honey-garlic-chicken-wings.jpg",
    category: "chicken-wings",
  },
]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<Array<{ item: FoodItem; quantity: number }>>([])
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false)
  const [showCartSheet, setShowCartSheet] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[v0] Auth state changed:", firebaseUser?.email || "No user")
      if (firebaseUser && firebaseUser.emailVerified) {
        console.log("[v0] User authenticated and verified:", firebaseUser.email)
        setUser({
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        })
        setUserId(firebaseUser.uid)

        // Load cart from Firestore
        const firestoreCart = await loadCartFromFirestore(firebaseUser.uid)
        const loadedCart = firestoreCart
          .map((firestoreItem) => {
            const menuItem = menuItems.find((item) => item.id === firestoreItem.itemId)
            return menuItem ? { item: menuItem, quantity: firestoreItem.quantity } : null
          })
          .filter((item): item is { item: FoodItem; quantity: number } => item !== null)

        setCart(loadedCart)
      } else {
        console.log("[v0] No authenticated user or user not verified")
        setUser(null)
        setUserId(null)
        setCart([])
      }
      setAuthLoading(false)
    })

    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("verified") === "true") {
      setShowAuthDialog(true)
    }

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (userId && cart.length >= 0) {
      const firestoreCart: FirestoreCartItem[] = cart.map((cartItem) => ({
        itemId: cartItem.item.id,
        name: cartItem.item.name,
        price: cartItem.item.price,
        quantity: cartItem.quantity,
        image: cartItem.item.image,
        description: cartItem.item.description,
        category: cartItem.item.category,
      }))
      saveCartToFirestore(userId, firestoreCart).catch((error) => {
        console.error("[v0] Failed to save cart:", error)
      })
    }
  }, [cart, userId])

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "best-sellers" ? item.isBestSeller : item.category === activeCategory)
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddClick = (item: FoodItem) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please create an account or sign in to add items to cart.",
      })
      setShowAuthDialog(true)
      return
    }
    setSelectedItem(item)
    setShowAddToCartDialog(true)
  }

  const handleAddToCart = (item: FoodItem, quantity: number) => {
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.item.id === item.id)

    if (existingItemIndex >= 0) {
      const newCart = [...cart]
      newCart[existingItemIndex].quantity += quantity
      setCart(newCart)
    } else {
      setCart([...cart, { item, quantity }])
    }

    toast({
      title: "Added to cart",
      description: `${quantity}x ${item.name} added to your cart.`,
    })
  }

  const handleOrderClick = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first!",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to place an order.",
      })
      setShowAuthDialog(true)
    } else {
      setShowCheckoutDialog(true)
    }
  }

  const handleCartClick = () => {
    setShowCartSheet(true)
  }

  const handleCheckoutFromCart = () => {
    if (!user) {
      setShowCartSheet(false)
      setShowAuthDialog(true)
      toast({
        title: "Login required",
        description: "Please sign in to place an order.",
      })
    } else {
      setShowCartSheet(false)
      setShowCheckoutDialog(true)
    }
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCart((prevCart) =>
      prevCart.map((cartItem) => (cartItem.item.id === itemId ? { ...cartItem, quantity: newQuantity } : cartItem)),
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.item.id !== itemId))
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    })
  }

  const handleOrderComplete = async () => {
    setCart([])
    if (userId) {
      await clearCartFromFirestore(userId)
    }
    toast({
      title: "Order confirmed!",
      description: "Thank you for your order. We'll prepare it right away!",
    })
  }

  const handleAuthSuccess = (userData: { email: string; name: string }) => {
    setUser(userData)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      console.log("[v0] Starting sign out process")
      if (userId) {
        try {
          await clearCartFromFirestore(userId)
          console.log("[v0] Cart cleared from Firestore")
        } catch (cartError) {
          console.log("[v0] Cart clear failed (non-critical):", cartError)
          // Continue with sign out even if cart clear fails
        }
      }
      await signOut(auth)
      console.log("[v0] Firebase sign out successful")
      setUser(null)
      setUserId(null)
      setCart([])
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
      console.log("[v0] Refreshing page after sign out")
      window.location.reload()
    } catch (error: any) {
      console.error("[v0] Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      setIsSigningOut(false)
    }
  }

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true)
  }

  const handleConfirmedSignOut = async () => {
    await handleSignOut()
    setShowSignOutConfirm(false)
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = cart.reduce((sum, cartItem) => sum + cartItem.item.price * cartItem.quantity, 0)

  return (
    <div className="flex min-h-screen">
      <FoodSidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        cartItemCount={totalCartItems}
        onCartClick={handleCartClick}
        onOrderClick={handleOrderClick}
      />

      <main className="flex-1 w-full lg:ml-0 overflow-y-auto">
        <div className="container mx-auto px-4 py-20 lg:py-8 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-balance">
                  {activeCategory === "all" && "All Menu Items"}
                  {activeCategory === "main-dishes" && "Main Dishes"}
                  {activeCategory === "chicken-wings" && "Chicken & Wings"}
                  {activeCategory === "spaghetti-noodles" && "Spaghetti & Noodles"}
                  {activeCategory === "desserts" && "Desserts"}
                  {activeCategory === "best-sellers" && "Best Sellers"}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} available
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="relative bg-transparent lg:hidden"
                  onClick={handleCartClick}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs font-semibold flex items-center justify-center">
                      {totalCartItems}
                    </span>
                  )}
                </Button>
                {authLoading ? (
                  <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
                ) : user ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="px-2 sm:px-3"
                      onClick={() => setShowProfileDialog(true)}
                    >
                      <User className="h-4 w-4" />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline ml-2">{user.name}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-xs sm:text-sm"
                      onClick={handleSignOutClick}
                      disabled={isSigningOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-transparent text-xs sm:text-sm"
                    onClick={() => setShowAuthDialog(true)}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Food Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              {filteredItems.map((item) => (
                <FoodItemCard key={item.id} item={item} onAddClick={handleAddClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      {/* Authentication Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onAuthSuccess={handleAuthSuccess} />

      {/* Quantity Selection Dialog */}
      <AddToCartDialog
        item={selectedItem}
        open={showAddToCartDialog}
        onOpenChange={setShowAddToCartDialog}
        onConfirm={handleAddToCart}
      />

      <CartSheet
        open={showCartSheet}
        onOpenChange={setShowCartSheet}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutFromCart}
      />

      <CheckoutDialog
        open={showCheckoutDialog}
        onOpenChange={setShowCheckoutDialog}
        cart={cart}
        totalAmount={totalAmount}
        onOrderComplete={handleOrderComplete}
        userEmail={user?.email || ""}
      />

      <UserProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        user={user}
        onSignOut={handleSignOut}
      />

      <SignOutConfirmationDialog
        open={showSignOutConfirm}
        onOpenChange={setShowSignOutConfirm}
        onConfirm={handleConfirmedSignOut}
        isLoading={isSigningOut}
      />
    </div>
  )
}
