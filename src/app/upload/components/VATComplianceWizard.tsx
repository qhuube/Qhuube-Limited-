/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import UploadStep from "./upload-step"
import OverviewStep from "./overview-step"
import CorrectionStep from "./correction-step"
import StepIndicator from "./step-indicator"
import PaymentStep from "./payment-step"
import { useSearchParams, useRouter } from "next/navigation"
import Footer from "./footer"
import { useUploadStore } from "@/store/uploadStore"

const VATComplianceWizard = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const { uploadedFile, setUploadedFile, restoreFileObject, paymentCompleted, isPaymentValidForSession } =
        useUploadStore()

    useEffect(() => {
        restoreFileObject()
    }, [restoreFileObject])

    useEffect(() => {
        const stepParam = Number(searchParams.get("step"))
        const paymentSuccess = searchParams.get("payment_success")

        console.log("[v0] Navigation effect triggered:", { stepParam, paymentSuccess, uploadedFile: !!uploadedFile })

        const noFileUploaded = !uploadedFile

        if (stepParam > 1 && noFileUploaded) {
            const isPaymentValid = isPaymentValidForSession()
            console.log("[v0] No file uploaded, checking payment validity:", isPaymentValid)

            // Don't redirect if user is on overview step with valid payment
            if (stepParam === 4 && isPaymentValid) {
                console.log("[v0] Staying on overview step - payment is valid")
                setCurrentStep(4)
                return
            }

            console.log("[v0] Redirecting to step 1 - no file and no valid payment")
            setCurrentStep(1)
            router.push("/upload?step=1")
            return
        }

        const isPaymentValid = isPaymentValidForSession()
        console.log("[v0] Payment validation result:", isPaymentValid)

        if (stepParam === 4 && !isPaymentValid) {
            console.log("[v0] Redirecting from overview to payment - payment not valid")
            setCurrentStep(3)
            router.push("/upload?step=3")
            return
        }

        if (!isNaN(stepParam) && stepParam >= 1 && stepParam <= 4) {
            console.log("[v0] Setting current step to:", stepParam)
            setCurrentStep(stepParam)
        }

        if (paymentSuccess === "true") {
            console.log("[v0] Payment success detected, cleaning up localStorage")
            localStorage.removeItem("pre-payment-step")
            localStorage.removeItem("payment-initiated")
        }
    }, [searchParams, paymentCompleted, uploadedFile, router, isPaymentValidForSession])

    const [correctedData, setCorrectedData] = useState<any>(null)

    const steps = [
        { id: 1, name: "Upload", component: UploadStep },
        { id: 2, name: "Correction", component: CorrectionStep },
        { id: 3, name: "Payment", component: PaymentStep },
        { id: 4, name: "Overview", component: OverviewStep },
    ]

    const handleNext = () => {
        if (currentStep < steps.length) {
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
            router.push(`/upload?step=${nextStep}`)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            const prevStep = currentStep - 1
            setCurrentStep(prevStep)
            router.push(`/upload?step=${prevStep}`)
        }
    }

    const handleStepClick = (stepId: number) => {
        const isPaymentValid = isPaymentValidForSession()
        console.log("[v0] Step click:", { stepId, currentStep, isPaymentValid })

        if (stepId <= currentStep || stepId === currentStep + 1 || (stepId === 4 && isPaymentValid)) {
            setCurrentStep(stepId)
            router.push(`/upload?step=${stepId}`)
        }
    }

    const CurrentStepComponent = steps[currentStep - 1].component

    return (
        <div className="min-h-screen flex flex-col justify-between">
            <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={currentStep === 2 ? "" : "pt-20"}
            >
                <CurrentStepComponent
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                    correctedData={correctedData}
                    setCorrectedData={setCorrectedData}
                />
            </motion.div>
            <Footer />
        </div>
    )
}

export default VATComplianceWizard
