import { db } from "./firebase"
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore"

export interface CartItem {
  itemId: string
  name: string
  price: number
  quantity: number
  image: string
  description: string
  category: string
}

export async function saveCartToFirestore(userId: string, cart: CartItem[]) {
  try {
    const cartRef = doc(db, "carts", userId)
    await setDoc(cartRef, {
      items: cart,
      updatedAt: new Date().toISOString(),
    })
    console.log("[v0] Cart saved to Firestore for user:", userId)
  } catch (error) {
    console.error("[v0] Error saving cart:", error)
    throw error
  }
}

export async function loadCartFromFirestore(userId: string): Promise<CartItem[]> {
  try {
    const cartRef = doc(db, "carts", userId)
    const cartSnap = await getDoc(cartRef)

    if (cartSnap.exists()) {
      const data = cartSnap.data()
      console.log("[v0] Cart loaded from Firestore for user:", userId)
      return data.items || []
    } else {
      console.log("[v0] No cart found in Firestore for user:", userId)
      return []
    }
  } catch (error) {
    console.error("[v0] Error loading cart:", error)
    return []
  }
}

export async function clearCartFromFirestore(userId: string) {
  try {
    const cartRef = doc(db, "carts", userId)
    await deleteDoc(cartRef)
    console.log("[v0] Cart cleared from Firestore for user:", userId)
  } catch (error) {
    console.error("[v0] Error clearing cart:", error)
    throw error
  }
}
