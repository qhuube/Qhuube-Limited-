"use client"
import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeInLeft } from "@/lib/animation"
import { useFileUpload } from "../hooks/useFileUpload"
import { useRouter } from "next/navigation"
import type { UploadStepProps } from "@/app/types"
import { getFileIcon, formatFileSize } from "@/app/utils" // Import the missing functions

const UploadStep = ({ onNext }: UploadStepProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [isAmazonFile, setIsAmazonFile] = useState(false)
  const router = useRouter()
  const { uploadedFile, uploadProgress, handleFile, removeFile } = useFileUpload()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files?.length) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const fileUploaded = uploadedFile && uploadProgress >= 100
  const canContinue = fileUploaded

  return (
    <>
      <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="w-full max-w-2xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            {!uploadedFile && (
              <motion.div variants={fadeInLeft} className="text-center px-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Upload Your File</h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Drag and drop your file or click to browse. We support CSV, XLS, and XLSX formats.
                </p>
              </motion.div>
            )}

            {/* Upload Area */}
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              animate="show"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
            >
              <div
                className={`relative border-2 border-dashed rounded-lg text-center transition-all duration-300 ${
                  dragActive ? "border-sky-500 bg-sky-50" : "border-gray-300 hover:border-sky-400 hover:bg-gray-50"
                } h-44 flex flex-col items-center justify-center`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    <span className="hidden sm:inline">Drag & drop file or </span>
                    <span className="text-sky-600 cursor-pointer hover:underline">
                      {!uploadedFile ? "Choose file" : "Replace file"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">CSV, XLS, XLSX</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              animate="show"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
            >
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAmazonFile}
                  onChange={(e) => setIsAmazonFile(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-sm sm:text-base font-medium text-gray-900">This is an Amazon file</span>
              </label>
            </motion.div>

            {/* Upload Progress */}
            {uploadedFile && uploadProgress < 100 && (
              <motion.div
                variants={fadeInLeft}
                initial="hidden"
                animate="show"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Uploading File</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0">
                        {uploadedFile.name}
                      </span>
                      <span className="text-sm text-gray-500 flex-shrink-0">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Uploaded File */}
            {uploadedFile && uploadProgress >= 100 && (
              <motion.div
                variants={fadeInLeft}
                initial="hidden"
                animate="show"
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Uploaded File</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">{getFileIcon(uploadedFile.name)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate pr-2">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile()}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors ml-2"
                    aria-label={`Remove ${uploadedFile.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              animate="show"
              className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-between pt-2"
            >
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                className={`w-full sm:w-auto px-6 py-2.5 text-white transition-all ${
                  canContinue ? "bg-sky-600 hover:bg-sky-700" : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!canContinue}
                onClick={onNext}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UploadStep
