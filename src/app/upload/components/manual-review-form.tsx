/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState } from "react"
import { Mail, AlertTriangle, Clock, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ManualReviewFormProps } from "@/app/types"


export default function ManualReviewForm({
    onEmailSubmit,
    onCancel,
}: ManualReviewFormProps) {
    const [adminEmail, setAdminEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email.trim())
    }

    const handleSubmitEmail = async () => {
        const trimmedEmail = adminEmail.trim()
        if (!trimmedEmail) {
            toast.error("Please enter an email address")
            return
        }

        if (!isValidEmail(trimmedEmail)) {
            toast.error("Please enter a valid email address")
            return
        }

        setIsSubmitting(true)
        try {
            await onEmailSubmit(trimmedEmail)
            setAdminEmail("")
            toast.success("Manual review request submitted successfully!")
        } catch (error) {
            toast.error("Failed to submit email. Please try again.")
            console.error("Email submission error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isSubmitting && isValidEmail(adminEmail.trim())) {
            handleSubmitEmail()
        }
    }

    return (
        <div className="w-full max-w-2xl mt-20 xl:mt-10 mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-700">Manual Review Required</h2>
                </div>

                <div className="space-y-6">
                    <Alert className="border border-gray-200 bg-white">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <AlertDescription className="text-gray-800 text-sm">
                            Your file requires manual review.
                        </AlertDescription>
                    </Alert>

                    {/* Email Input Section */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="mb-4">
                            <Label
                                htmlFor="admin-email"
                                className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-2"
                            >
                                <Mail className="w-5 h-5 text-blue-600" />
                                Administrator Email Address
                            </Label>
                            <p className="text-sm text-gray-600">
                                Enter the email address where you&apos;d like to receive the completed tax compliance report. Our team will
                                process the manual entries and deliver the results within 24 hours. The processed file data will be
                                included for review.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                id="admin-email"
                                type="email"
                                placeholder="admin@yourcompany.com"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                                disabled={isSubmitting}
                                autoComplete="email"
                            />

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSubmitEmail}
                                    disabled={!adminEmail.trim() || !isValidEmail(adminEmail.trim()) || isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 h-12 text-base font-semibold shadow-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                                            Processing Request...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5 mr-3" />
                                            Submit for Manual Review
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Review Process Information */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start gap-2">
                            <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Review Process</h4>
                                <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
                                    <li>Compliance team receives your file and processed data.</li>
                                    <li>Manual VAT rate lookup and verification for each flagged entry.</li>
                                    <li>Processed file is reviewed and corrected by our experts.</li>
                                    <li>Completed file delivered to your email within 24 hours.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
