"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { fadeInLeft } from "@/lib/animation"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { useUploadStore } from "@/store/uploadStore"
import { toast } from "sonner"

interface Offer {
  _id: string
  title: string
  text: string
  amount: number
  discount: number
  price: number
}

interface OfferStepProps {
  onNext: () => void
  onPrevious: () => void
}

const OfferStep = ({ onNext, onPrevious }: OfferStepProps) => {
  const [vatRegistered, setVatRegistered] = useState<boolean | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoadingOffers, setIsLoadingOffers] = useState(false)
  const { setOrderData } = useUploadStore()

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setIsLoadingOffers(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to fetch offers")

      const data = await response.json()
      if (data.success) setOffers(data.offers)
    } catch (error) {
      console.error("[OfferStep] Error fetching offers:", error)
      toast("Failed to load offers")
    } finally {
      setIsLoadingOffers(false)
    }
  }

  const handleVatSelection = (isRegistered: boolean) => {
    setVatRegistered(isRegistered)
    setSelectedOffer(null)
  }

  const handleOfferSelection = (offerId: string) => {
    setSelectedOffer(offerId)
  }

  const getFilteredOffers = () => {
    return offers.filter((offer) => {
      if (vatRegistered && offer.title === "OSS Filing Service") return true
      if (!vatRegistered && offer.title === "VAT Registration + OSS Filing") return true
      return false
    })
  }

  const handleContinue = () => {
    if (selectedOffer === "no") {
      setOrderData({
        selectedService: "no",
        offerType: vatRegistered ? "vat-registered" : "needs-vat-registration",
        offerPrice: 0,
        basePrice: 0,
      })
      onNext()
      return
    }

    const selected = offers.find((o) => o._id === selectedOffer)
    if (!selected) return

    const offerType = vatRegistered ? "vat-registered" : "needs-vat-registration"
    setOrderData({
      selectedService: "yes",
      offerType,
      offerPrice: selected.price,
      basePrice: selected.amount,
    })
    onNext()
  }

  const filteredOffers = getFilteredOffers()

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 mt-12 bg-white">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div variants={fadeInLeft} initial="hidden" animate="show" className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Want Qhuube to file your OSS report for you?
          </h1>
          <p className="text-base text-gray-600 max-w-2xl">
            Save time and avoid mistakes let Qhuube file your OSS return directly with Revenue on your behalf.
          </p>
          <p className="text-sm text-gray-600">
            No paperwork · No confusion · Full support included
          </p>
        </motion.div>

        {/* VAT Selection */}
        <motion.div variants={fadeInLeft} initial="hidden" animate="show" className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Are you already VAT registered?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleVatSelection(true)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                vatRegistered === true
                  ? "border-sky-600 bg-sky-50 text-sky-900"
                  : "border-gray-200 bg-white text-gray-900 hover:border-sky-300"
              }`}
            >
              Yes, I am
            </button>

            <button
              onClick={() => handleVatSelection(false)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                vatRegistered === false
                  ? "border-sky-600 bg-sky-50 text-sky-900"
                  : "border-gray-200 bg-white text-gray-900 hover:border-sky-300"
              }`}
            >
              No, I need VAT registration too
            </button>
          </div>
        </motion.div>

        {/* Offer Selection */}
        {vatRegistered !== null && (
          <motion.div variants={fadeInLeft} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Choose your service</h2>

            {isLoadingOffers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Conditional Offers */}
                {filteredOffers.map((offer) => (
                  <label
                    key={offer._id}
                    onClick={() => handleOfferSelection(offer._id)}
                    className={`block border-2 rounded-xl p-5 sm:p-6 cursor-pointer transition-all duration-200 relative ${
                      selectedOffer === offer._id
                        ? "border-sky-600 bg-sky-50"
                        : "border-gray-200 bg-white hover:border-sky-300"
                    }`}
                  >
                    {offer.discount > 0 && (
                      <div className="absolute -top-3 left-4 bg-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {offer.discount}% discount - Limited Time Offer
                      </div>
                    )}

                    <div className={`flex items-start justify-between gap-4 ${offer.discount > 0 ? "pt-2" : ""}`}>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">{offer.title}</h3>
                          {selectedOffer === offer._id && (
                            <Check className="w-5 h-5 text-sky-600 flex-shrink-0" />
                          )}
                        </div>

                        {/* Offer text rendered as dot-points */}
                        <div className="text-sm text-gray-600 space-y-1">
                          {offer.text.split(".").map(
                            (point, index) =>
                              point.trim() && (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="text-sky-600 mt-0.5">•</span>
                                  <span>{point.trim()}</span>
                                </div>
                              )
                          )}
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <p className="text-2xl sm:text-3xl font-bold text-sky-600">€{offer.price}</p>
                        {offer.discount > 0 && (
                          <p className="text-sm text-gray-500 line-through">€{offer.amount}</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}

                {/* Just the Report Option */}
                <label
                  onClick={() => handleOfferSelection("no")}
                  className={`block border-2 rounded-xl p-5 sm:p-6 cursor-pointer transition-all duration-200 ${
                    selectedOffer === "no"
                      ? "border-sky-600 bg-sky-50"
                      : "border-gray-200 bg-white hover:border-sky-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          No thanks, just give me the report
                        </h3>
                        {selectedOffer === "no" && (
                          <Check className="w-5 h-5 text-sky-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        You&apos;ll get your completed OSS report and handle the filing yourself.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            )}
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <motion.div
          variants={fadeInLeft}
          initial="hidden"
          animate="show"
          className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between pt-6"
        >
          <Button
            variant="outline"
            onClick={onPrevious}
            className="w-full sm:w-auto px-6 py-2.5 h-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            className="w-full sm:w-auto px-6 py-2.5 h-auto bg-sky-600 hover:bg-sky-700 text-white"
            disabled={!selectedOffer || isLoadingOffers}
            onClick={handleContinue}
          >
            {selectedOffer === "no" ? "Continue" : "Yes, file it for me"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default OfferStep
