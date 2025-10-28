import type { FileMeta, UploadState } from "@/app/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
}

// Helper function to convert base64 back to File
const base64ToFile = (base64: string, filename: string, type: string): File => {
    const arr = base64.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || type
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
}

export const useUploadStore = create<UploadState>()(
    persist(
        (set, get) => ({
            uploadedFile: null,
            uploadProgress: 0,
            sessionId: null,
            paymentCompleted: false,
            paymentInfo: { completed: false },

            setUploadedFile: (file) => set({ uploadedFile: file }),

            addUploadedFile: async (file) => {
                set({
                    paymentCompleted: false,
                    paymentInfo: { completed: false },
                    sessionId: null,
                })

                try {
                    const fileData = await fileToBase64(file)
                    const fileMeta: FileMeta = {
                        file,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        fileData,
                    }
                    set({ uploadedFile: fileMeta })
                } catch (error) {
                    console.error("Error converting file to base64:", error)
                    // Fallback without file data
                    const fileMeta: FileMeta = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                    }
                    set({ uploadedFile: fileMeta })
                }
            },

            setUploadProgress: (progress) => set({ uploadProgress: progress }),

            clearFile: () =>
                set({
                    uploadedFile: null,
                    uploadProgress: 0,
                    sessionId: null,
                    paymentCompleted: false,
                    paymentInfo: { completed: false },
                }),

            setSessionId: (sessionId) => set({ sessionId }),

            setPaymentCompleted: (completed) => {
                const state = get()
                if (completed && state.sessionId) {
                    // Store payment completion with session ID
                    set({
                        paymentCompleted: completed,
                        paymentInfo: {
                            completed,
                            sessionId: state.sessionId,
                            completedAt: Date.now(),
                        },
                    })
                } else {
                    set({ paymentCompleted: completed })
                }
            },

            setPaymentInfo: (info) => set({ paymentInfo: info }),

            resetForNewFile: () => {
                set({
                    uploadedFile: null,
                    uploadProgress: 0,
                    sessionId: null,
                    paymentCompleted: false,
                    paymentInfo: { completed: false },
                })
            },

            isPaymentValidForSession: () => {
                const state = get()
                if (!state.paymentCompleted || !state.sessionId) {
                    return false
                }

                // Check if payment was completed for the current session
                return state.paymentInfo?.sessionId === state.sessionId
            },

            // Restore File object from persisted base64 data
            restoreFileObject: () => {
                const state = get()
                if (state.uploadedFile && !state.uploadedFile.file && state.uploadedFile.fileData) {
                    try {
                        const restoredFile = base64ToFile(
                            state.uploadedFile.fileData,
                            state.uploadedFile.name,
                            state.uploadedFile.type,
                        )
                        set({
                            uploadedFile: {
                                ...state.uploadedFile,
                                file: restoredFile,
                            },
                        })
                    } catch (error) {
                        console.error("Error restoring file from base64:", error)
                    }
                }
            },
        }),
        {
            name: "vat-upload-storage",
            // Only persist essential data, not File objects
            partialize: (state) => ({
                uploadedFile: state.uploadedFile
                    ? {
                        name: state.uploadedFile.name,
                        size: state.uploadedFile.size,
                        type: state.uploadedFile.type,
                        fileData: state.uploadedFile.fileData,
                        // Don't persist the File object
                    }
                    : null,
                uploadProgress: state.uploadProgress,
                sessionId: state.sessionId,
                paymentCompleted: state.paymentCompleted,
                paymentInfo: state.paymentInfo,
            }),
        },
    ),
)
