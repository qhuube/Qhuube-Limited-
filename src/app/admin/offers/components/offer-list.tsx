"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"

interface Offer {
  _id: string
  title: string
  text: string
  amount: number
  discount: number
  price: number
}

interface OfferListProps {
  offers: Offer[]
  onEdit: (offer: Offer) => void
  onDeleteClick: (offerId: string) => void
  isLoading?: boolean
}

export function OfferList({ offers, onEdit, onDeleteClick, isLoading }: OfferListProps) {
  return (
    <div className="space-y-3">
      {offers.length === 0 ? (
        <Card className="p-8 text-center bg-white border border-gray-200">
          <p className="text-gray-500">No offers found. Create your first offer to get started.</p>
        </Card>
      ) : (
        offers.map((offer) => (
          <Card key={offer._id} className="p-4 bg-white border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{offer.text}</p>
                <div className="flex gap-6 mt-3 text-sm">
                  <span className="text-gray-600">
                    <strong>Amount:</strong> {offer.amount}
                  </span>
                  <span className="text-gray-600">
                    <strong>Discount:</strong> {offer.discount}%
                  </span>
                  <span className="text-sky-600 font-semibold">
                    <strong>Price:</strong> ${offer.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(offer)}
                  disabled={isLoading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteClick(offer._id)}
                  disabled={isLoading}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
