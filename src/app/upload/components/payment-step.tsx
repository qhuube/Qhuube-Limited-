"use client"

import { CreditCard, ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PaymentStepProps } from "@/app/types"
import { useUploadStore } from "@/store/uploadStore"
import { useEffect } from "react"
import { price } from "@/lib/price"

const PaymentStep = ({ onPrevious, onNext }: PaymentStepProps) => {
    const { uploadedFile, sessionId, setPaymentInfo, setSessionId, isPaymentValidForSession } = useUploadStore()

    // Check if payment was already completed (useful for page refreshes)
    useEffect(() => {
        // Check URL parameters for payment success
        const urlParams = new URLSearchParams(window.location.search)
        const paymentSuccess = urlParams.get("payment_success")
        const urlSessionId = urlParams.get("session_id")

        if (paymentSuccess === "true" && urlSessionId && sessionId) {
            setPaymentInfo({
                completed: true,
                sessionId: sessionId, // Store session ID with payment info
                completedAt: Date.now(),
            })
            // Auto-advance to next step after successful payment
            setTimeout(() => {
                onNext?.()
            }, 1000)
        }
    }, [sessionId, setPaymentInfo, onNext])

    useEffect(() => {
        if (uploadedFile && !sessionId) {
            const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            setSessionId(newSessionId)
        }
    }, [uploadedFile, sessionId, setSessionId])

    const handleStripePayment = async () => {
        if (!uploadedFile || !sessionId) {
            alert("Please upload a file first")
            return
        }

        try {
            const paymentData = {
                amount: price,
                description: "Tax Compliance File Processing",
                metadata: {
                    fileName: uploadedFile.name,
                    fileSize: uploadedFile.size,
                    sessionId: sessionId,
                    returnUrl: window.location.origin + window.location.pathname + "?step=3&payment_success=true",
                },
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/pricing/stripe/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentData),
            })

            const data = await response.json()
            if (data.checkoutUrl) {
                // Store current state before redirect
                localStorage.setItem("pre-payment-step", "3")
                localStorage.setItem("payment-initiated", Date.now().toString())

                window.location.href = data.checkoutUrl
            } else {
                alert(data.error || "Payment failed")
            }
        } catch (error) {
            console.error(error)
            alert("An unexpected error occurred")
        }
    }

    const isPaymentValid = isPaymentValidForSession()

    // If payment is completed for current session, show success state
    if (isPaymentValid) {
        return (
            <div className="flex items-center justify-center px-4 py-4 sm:py-6 lg:py-8 mt-16 xl:mt-5">
                <div className="w-full max-w-xl">
                    <div className="text-center mb-6 lg:mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                            Your payment has been processed successfully. You can now access your VAT report.
                        </p>
                    </div>

                    <Card className="shadow-xl border border-gray-100 bg-white">
                        <CardContent className="p-8 sm:p-10 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Download</h2>
                            <p className="text-gray-600 mb-6">
                                Your file &quot;{uploadedFile?.name}&quot; has been processed and is ready for download.
                            </p>
                            <Button
                                onClick={onNext}
                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-sm shadow-md"
                            >
                                Continue to Download
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center px-4 py-4 sm:py-6 lg:py-8 mt-16 xl:mt-5">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="text-center mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Secure Your Compliance</h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                        Final step complete a one time payment to process and download your tax compliant file.
                    </p>
                </div>

                {/* Payment Card */}
                <Card className="shadow-xl border border-gray-100 bg-white">
                    <CardContent className="p-8 sm:p-10">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-[1.75rem] font-semibold text-gray-900">Secure Checkout</h2>
                            <p className="text-sm text-gray-500 mt-1">Access your full VAT report immediately</p>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-gray-50 border border-gray-200 rounded-sm p-5 mb-6 space-y-1">
                            <div className="flex justify-between items-center text-base font-medium text-gray-700">
                                <span>VAT Compliance Package</span>
                                <span className="text-xl font-bold text-gray-900">€{price}</span>
                            </div>
                            <p className="text-sm text-gray-500">Includes 1 document • Full VAT processing</p>
                        </div>

                        {/* CTA */}
                        <Button
                            onClick={handleStripePayment}
                            disabled={!uploadedFile || !sessionId}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-base font-semibold rounded-sm shadow-md"
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay €{price} Securely
                        </Button>

                        {/* Validation Message */}
                        {!uploadedFile && (
                            <p className="text-sm text-red-600 text-center mt-3">
                                Please upload a file before proceeding to payment.
                            </p>
                        )}

                        {/* Security Info */}
                        <div className="flex justify-center mt-5">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span>Secured by Stripe • SSL Encrypted</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back Navigation */}
                <div className="flex justify-start mt-6">
                    <Button
                        variant="outline"
                        onClick={onPrevious}
                        className="w-full sm:w-auto cursor-pointer h-10 bg-transparent flex items-center justify-center px-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PaymentStep
