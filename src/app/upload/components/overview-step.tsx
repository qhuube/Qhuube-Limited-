/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  FileText,
  Download,
  CheckCircle,
  Mail,
  FileSpreadsheet,
  FileTextIcon,
  RotateCcw,
  ArrowLeft,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useUploadStore } from "@/store/uploadStore"
import axios from "axios"
import ManualReviewForm from "./manual-review-form"

interface OverviewStepProps {
  onPrevious: () => void
}

export default function OverviewStep({ onPrevious }: OverviewStepProps) {
  const { uploadedFile, sessionId, resetForNewFile } = useUploadStore()

  // Email for sending reports to users
  const [reportEmail, setReportEmail] = useState("")
  const [isReportEmailSending, setIsReportEmailSending] = useState(false)
  const [reportEmailSent, setReportEmailSent] = useState(false)

  // Download states
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  const [showManualReviewForm, setShowManualReviewForm] = useState(false)
  const [currentManualReviewFile, setCurrentManualReviewFile] = useState<string>("")
  const [manualReviewCount, setManualReviewCount] = useState(0)
  const [processedFileData, setProcessedFileData] = useState<any>(null)

  const [isCheckingManualReview, setIsCheckingManualReview] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const checkManualReviewStatus = async () => {
      if (!uploadedFile || !sessionId) {
        setIsCheckingManualReview(false)
        return
      }

      try {
        const formData = new FormData()
        formData.append("user_email", "")

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/download-vat-report/${sessionId}`,
          formData,
          { responseType: "blob" }
        )

        const contentType = response.headers["content-type"]

        if (contentType?.includes("application/json")) {
          const text = await response.data.text()
          const json = JSON.parse(text)

          if (json.status === "manual_review_required") {
            setCurrentManualReviewFile(uploadedFile.name)
            setManualReviewCount(json.manual_review_count || 1)
            setProcessedFileData(json.manual_review_rows || [])
            setShowManualReviewForm(true)
          }
        }
      } catch (error: any) {
        console.error("[v0] Error checking manual review status for", uploadedFile.name, ":", error)
      }

      setIsCheckingManualReview(false)
    }

    checkManualReviewStatus()
  }, [uploadedFile, sessionId])

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  async function sendAdminManualReviewEmail(adminEmail: string, fileName: string, processedData: any) {
    if (!sessionId) throw new Error("Session not found for this file")

    const formData = new FormData()
    formData.append("user_email", adminEmail)
    formData.append("file_name", fileName)
    formData.append("processed_data", JSON.stringify(processedData))

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/send-manual-review-admin-email/${sessionId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return res.data
  }

  async function handleManualReviewEmailSubmit(adminEmail: string) {
    if (!adminEmail) {
      toast.error("Please enter a valid email address")
      return
    }

    try {
      await sendAdminManualReviewEmail(adminEmail, currentManualReviewFile, processedFileData)
      setReportEmailSent(true)
      toast.success(
        `Manual review request submitted! Admin will receive the processed file and you'll get the VAT report for ${currentManualReviewFile} within 24 hours.`
      )
      setShowManualReviewForm(false)
      setCurrentManualReviewFile("")
      setManualReviewCount(0)
      setProcessedFileData(null)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || "Please try again."
      toast.error(`Failed to submit manual review request: ${errorMessage}`)
    }
  }

  async function downloadVatReportForFile(fileName: string) {
    setIsDownloadingAll(true)
    setDownloadingFiles((prev) => new Set(prev).add(fileName))

    try {
      if (!sessionId) {
        toast.error("Session not found for this file")
        return
      }

      const formData = new FormData()
      formData.append("user_email", "")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/download-vat-report/${sessionId}`,
        { method: "POST", body: formData }
      )

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`)

      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        const json = await response.json()
        if (json.status === "manual_review_required") {
          setCurrentManualReviewFile(fileName)
          setManualReviewCount(json.manual_review_count || 1)
          setProcessedFileData(json.manual_review_rows || [])
          setShowManualReviewForm(true)
          return
        } else if (json.status === "manual_review_initiated") {
          toast.success(json.message)
          return
        } else {
          toast.error("Received unexpected response from server.")
          return
        }
      }

      const cd = response.headers.get("content-disposition")
      let filename = fileName.replace(/\.[^.]+$/, "")
      filename += contentType.includes("application/zip") ? "_vat_reports.zip" : "_vat_report.xlsx"
      if (cd) {
        const match = cd.match(/filename="?([^";]+)"?/i)
        if (match) filename = match[1]
      }

      const arrayBuffer = await response.arrayBuffer()
      const blob = new Blob([arrayBuffer], { type: contentType })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)

      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      if (isSafari) window.open(url, "_blank")
      else a.click()

      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success(
        contentType.includes("application/zip")
          ? "VAT ZIP file downloaded successfully"
          : "VAT report downloaded successfully"
      )
    } catch (err: any) {
      console.error("Download failed", err)
      toast.error(`Failed to download VAT report: ${err?.message || "Please try again."}`)
    } finally {
      setIsDownloadingAll(false)
      setDownloadingFiles((prev) => {
        const s = new Set(prev)
        s.delete(fileName)
        return s
      })
    }
  }

  // ---------- Handlers (hoisted function declarations) ----------
  async function handleDownloadAllReports() {
    if (!uploadedFile) {
      toast.error("No processed file to download")
      return
    }
    await downloadVatReportForFile(uploadedFile.name)
  }

  async function handleSendReportEmail() {
    if (!reportEmail || !isValidEmail(reportEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsReportEmailSending(true)

    try {
      if (!uploadedFile || !sessionId) {
        toast.error("No valid session found for the uploaded file")
        return
      }

      const formData = new FormData()
      formData.append("user_email", reportEmail)
      formData.append("file_name", uploadedFile.name)

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/send-vat-report-email/${sessionId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      toast.success(`Successfully sent report to ${reportEmail}`)
    } catch (error: any) {
      console.error("Failed to send email:", error)
      toast.error(`Failed to send email: ${error?.message || "Please try again later"}`)
    } finally {
      setIsReportEmailSending(false)
    }
  }
  // ----------------------------------------------------------------

  function getFileIcon(fileName: string) {
    const ext = fileName?.split(".").pop()?.toLowerCase()
    return ext === "csv" || ext === "txt" ? (
      <FileTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
    ) : (
      <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
    )
  }

  function handleStartNewProcess() {
    resetForNewFile()
    setReportEmail("")
    router.push("/upload?step=1")
  }

  interface LoaderProps {
    messages: string[]
    interval?: number
  }

  const Loader: React.FC<LoaderProps> = ({ messages, interval = 2000 }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
      }, interval)
      return () => clearInterval(timer)
    }, [messages, interval])

    return (
      <div className="flex items-center justify-center min-h-[600px] bg-white">
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-sky-600 animate-bounce" />
            <span className="w-3 h-3 rounded-full bg-sky-600 animate-bounce animation-delay-200" />
            <span className="w-3 h-3 rounded-full bg-sky-600 animate-bounce animation-delay-400" />
          </div>
          <p className="text-gray-600 text-base">{messages[currentMessageIndex]}</p>
        </div>
      </div>
    )
  }

  if (isCheckingManualReview) {
    return (
      <Loader
        messages={["Checking file processing status...", "Still processing, please wait...", "Almost done..."]}
        interval={1200}
      />
    )
  }

  if (reportEmailSent) {
    return (
      <div className="flex items-center justify-center mt-28 px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-5">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Email Sent Successfully!</h2>
          <p className="text-gray-700 mb-1">Your VAT compliance report will be sent to you shortly.</p>
          <p className="text-sm text-gray-500 mb-6">Please check your inbox and spam folder for the confirmation.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <Button onClick={handleStartNewProcess} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white">
              <RotateCcw className="w-4 h-4" />
              Start New Process
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showManualReviewForm) {
    return (
      <ManualReviewForm
        fileName={currentManualReviewFile}
        manualReviewCount={manualReviewCount}
        processedFileData={processedFileData}
        onEmailSubmit={handleManualReviewEmailSubmit}
        onCancel={() => {
          setShowManualReviewForm(false)
          setCurrentManualReviewFile("")
          setManualReviewCount(0)
          setProcessedFileData(null)
        }}
      />
    )
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 mt-20 xl:mt-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Processing Complete</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Your VAT compliance processing has been completed successfully. Review the results and download your report.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8 lg:px-10">
            <Card className="border border-gray-200 shadow-md rounded-xl">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base sm:text-lg">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  File Processed
                </h3>
                {uploadedFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      {getFileIcon(uploadedFile.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{uploadedFile.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Processed ✓
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm sm:text-base">No file found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-md rounded-xl">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-base sm:text-lg">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download Report
                </h3>

                <div className="space-y-4 mb-6">
                  {uploadedFile && (
                    <div className="space-y-3">
                      <Button
                        onClick={handleDownloadAllReports}
                        disabled={isDownloadingAll}
                        className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white justify-center h-12 text-base font-semibold shadow-lg"
                      >
                        {isDownloadingAll ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Downloading Report...
                          </>
                        ) : (
                          <>
                            <Package className="w-5 h-5" />
                            Download VAT Report
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 sm:pt-6">
                  <Label
                    htmlFor="report-email"
                    className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2 mb-3"
                  >
                    <Mail className="w-4 h-4" />
                    Email Report to User
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">Send the processed VAT report to a specific email address</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Input
                      id="report-email"
                      type="email"
                      placeholder="user@company.com"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="flex-1 py-2 lg:h-10 text-sm sm:text-base"
                    />
                    <Button
                      onClick={handleSendReportEmail}
                      disabled={!isValidEmail(reportEmail) || isReportEmailSending}
                      className="bg-purple-600 hover:bg-purple-700 text-white h-10 px-4 sm:px-6 w-full sm:w-auto"
                    >
                      {isReportEmailSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span className="hidden sm:inline">Send</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 lg:px-10">
            <Button
              variant="outline"
              onClick={onPrevious}
              className="w-full sm:w-auto bg-white border-gray-300 py-2 cursor-pointer text-gray-700 hover:bg-gray-50 px-4 sm:px-6 order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 cursor-pointer sm:px-6 w-full sm:w-auto order-1 sm:order-2"
              onClick={handleStartNewProcess}
            >
              <RotateCcw className="w-4 h-4" />
              Start New Process
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
