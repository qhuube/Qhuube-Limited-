"use client"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Step {
  id: number
  name: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick: (stepId: number) => void
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Logo */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5">
        <div className="flex items-center">
          <Link href="/" className="">
            <Image src="/icons/Logo-2.png" alt="Logo" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
          </Link>
        </div>
      </div>

      {/* Steps Container */}
      <div className="w-full px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex justify-center items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 mt-16 sm:mt-14 md:mt-12 lg:mt-8 xl:mt-4 flex-wrap">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 min-w-0 flex-shrink-0">
              {/* Step Circle & Label */}
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <motion.div
                  className={`flex items-center justify-center flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full border-2 text-xs sm:text-sm font-semibold transition-all duration-300
                      ${
                        step.id < currentStep
                          ? "bg-green-500 border-green-500 text-white"
                          : step.id === currentStep
                            ? "bg-sky-500 border-sky-500 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                      }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {step.id < currentStep ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <span>{step.id}</span>}
                </motion.div>
                <span
                  className={`text-xs sm:text-sm md:text-base font-medium hidden lg:inline-block truncate ${
                    step.id <= currentStep ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="h-0.5 flex-shrink-0 bg-gray-300 w-8 md:w-12 lg:w-16">
                  <div
                    className={`h-full transition-all duration-300 ${
                      step.id < currentStep ? "bg-green-500 w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
