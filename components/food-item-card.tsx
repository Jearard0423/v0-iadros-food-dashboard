"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Image from "next/image"

export interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isBestSeller?: boolean
}

interface FoodItemCardProps {
  item: FoodItem
  onAddClick: (item: FoodItem) => void
}

export function FoodItemCard({ item, onAddClick }: FoodItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-40 sm:h-48 w-full bg-muted">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
        {item.isBestSeller && (
          <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-accent text-accent-foreground text-xs">
            Best Seller
          </Badge>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-balance leading-tight">{item.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty line-clamp-2">{item.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-bold text-primary">₱{item.price.toFixed(2)}</span>
            <Button size="sm" className="gap-2 h-8 sm:h-9 text-xs sm:text-sm" onClick={() => onAddClick(item)}>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
