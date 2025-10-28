/* eslint-disable @typescript-eslint/no-explicit-any */


export interface FileMeta {
    file?: File // Make file optional for persistence
    name: string
    size: number
    type: string
    // Add serializable file data for persistence
    fileData?: string // base64 encoded file data
}

export interface UploadStepProps {
    onNext: () => void;
    onPrevious: () => void;
    currentStep: number;
    totalSteps: number;
}

interface PaymentInfo {
    completed: boolean
    sessionId?: string // Store session ID with payment info
    completedAt?: number // Timestamp of when payment was completed
}

export interface UploadState {
    uploadedFile: FileMeta | null // Single file instead of array
    uploadProgress: number // Single progress value instead of record
    sessionId: string | null // Single session ID instead of record
    paymentCompleted: boolean
    paymentInfo: PaymentInfo
    setUploadedFile: (file: FileMeta | null) => void
    addUploadedFile: (file: File) => void // Single file instead of array
    setUploadProgress: (progress: number) => void
    clearFile: () => void // Clear single file
    setSessionId: (sessionId: string) => void
    setPaymentCompleted: (completed: boolean) => void
    setPaymentInfo: (info: PaymentInfo) => void
    isPaymentValidForSession: () => boolean // Check if payment is valid for current session
    restoreFileObject: () => void // Restore single file object
    resetForNewFile: () => void // Reset everything for new file upload
}




export interface CorrectionStepProps {
    onNext: () => void
    onPrevious: () => void
    currentStep: number
    totalSteps: number
    uploadedFile: FileMeta | null
    setUploadedFile: (files: FileMeta | null) => void
    correctedData: any[]
    setCorrectedData: (data: any[]) => void
}

export interface TaxIssue {
    details?: {
        columnName: string;
        dataType: string;
        missingRows: number[];
        hasMoreRows: boolean;
        totalMissing: number;
        totalRows: number;
        description: string;
    } | undefined;
    id: number
    invoiceNumber: string
    invoiceDate: string
    taxCode: string
    vatAmount: number
    currency: string
    issueType: string
    originalValue: string
    suggestedValue: string
    status: "pending" | "corrected" | "ignored"
    severity: "High" | "Medium" | "Low"
}

// Enhanced issue type for better type safety
export interface ValidationIssue {
    id: number
    invoiceNumber: string
    invoiceDate: string
    taxCode: string
    vatAmount: number
    currency: string
    issueType: string
    originalValue: string
    suggestedValue: string
    status: "pending" | "corrected" | "ignored"
    severity: "High" | "Medium" | "Low"
    details?: {
        columnName?: string
        dataType?: string
        headerLabel?:string
        missingRows?: string[]
        invalidRows?: string[]
        hasMoreRows?: boolean
        totalMissing?: number
        totalRows?: number
        invalidCount?: number
        percentage?: number
        description?: string
        expectedType?: string
        issueType?:string
    }
}



export interface OverviewStepProps {
    onNext: () => void
    onPrevious: () => void
    currentStep: number
    totalSteps: number
    correctedData: any[]
}

export interface PaymentStepProps {
    onNext: () => void
    onPrevious: () => void
}


export interface PricingCardProps {
    plan: {
        id: string
        name: string
        price: string
        amount: number
        period: string
        originalPrice?: string
        description: string
        features: string[]
        popular: boolean
        buttonText: string
        color: string
        bgColor: string
    }
}


export interface TaxRule {
    id?: string
    _id?: string // Optional for edit operations
    product_type: string
    country: string
    vat_rate: number
    vat_category: string
    shipping_vat_rate: number
}

export interface Filters {
    search: string
    country: string
    vatCategory: string
    vatRateMin: string
    vatRateMax: string
}

export interface ManualReviewFormProps {
    fileName: string
    manualReviewCount: number
    processedFileData: any[]
    onEmailSubmit: (email: string) => Promise<void>
    onCancel: () => void
}