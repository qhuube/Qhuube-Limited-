/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { OfferFormDialog } from "./components/offer-form-dialog"
import { DeleteConfirmationDialog } from "./components/delete-confirmation-dialog"
import { OfferList } from "./components/offer-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Offer {
  _id: string
  title: string
  text: string
  amount: number
  discount: number
  price: number
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // Fetch offers on mount
  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch offers")
      }

      const data = await response.json()
      if (data.success) {
        setOffers(data.offers)
      }
    } catch (error) {
      toast("Failed to fetch offers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (formData: any) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/create/offer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create offer")
      }

      const data = await response.json()
      if (data.success) {
        toast("Offer created successfully")
        setShowFormDialog(false)
        await fetchOffers()
      }
    } catch (error) {
      toast("Failed to create offer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (formData: any) => {
    if (!editingOffer) return

    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/update/offer/${editingOffer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update offer")
      }

      const data = await response.json()
      if (data.success) {
        toast("Offer updated successfully")
        setEditingOffer(null)
        setShowFormDialog(false)
        await fetchOffers()
      }
    } catch (error) {
      toast("Failed to update offer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return

    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/delete/offer/${deleteTargetId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete offer")
      }

      toast("Offer deleted successfully")
      setDeleteTargetId(null)
      await fetchOffers()
    } catch (error) {
      toast("Failed to delete offer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer)
    setShowFormDialog(true)
  }

  const handleDeleteClick = (offerId: string) => {
    setDeleteTargetId(offerId)
    setDeleteConfirmOpen(true)
  }

  const handleCancelForm = () => {
    setShowFormDialog(false)
    setEditingOffer(null)
  }

  return (
    <div className="min-h-screen py-2 px-2 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Offers</h1>
            <p className="text-gray-600 mt-2">Create, edit, and manage your promotional offers</p>
          </div>
          <Button onClick={() => setShowFormDialog(true)} className="bg-sky-600 hover:bg-sky-700 text-white">
            <Plus className="w-4 h-4" />
            New Offer
          </Button>
        </div>

        <div className="space-y-6">
          <OfferFormDialog
            open={showFormDialog}
            onOpenChange={setShowFormDialog}
            initialData={editingOffer}
            onSubmit={editingOffer ? handleUpdate : handleCreate}
            isLoading={isLoading}
          />

          <DeleteConfirmationDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            onConfirm={handleDelete}
            isLoading={isLoading}
          />

          <OfferList offers={offers} onEdit={handleEdit} onDeleteClick={handleDeleteClick} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
