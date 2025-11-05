/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OfferFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    _id: string
    title: string
    text: string
    amount: number
    discount: number
    price: number
  } | null
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function OfferFormDialog({ open, onOpenChange, initialData, onSubmit, isLoading }: OfferFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    amount: 0,
    discount: 0,
    price: 0,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        text: initialData.text,
        amount: initialData.amount,
        discount: initialData.discount,
        price: initialData.price,
      })
    } else {
      setFormData({
        title: "",
        text: "",
        amount: 0,
        discount: 0,
        price: 0,
      })
    }
  }, [initialData, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "title" || name === "text" ? value : Number.parseFloat(value) || 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.text.trim()) {
      alert("Please fill in all required fields")
      return
    }
    await onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Offer" : "Create New Offer"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Sale"
              className="border-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <Textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Describe your offer..."
              rows={4}
              className="border-gray-300"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <Input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white">
              {isLoading ? "Saving..." : initialData ? "Update Offer" : "Create Offer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
