"use client"
import { useUploadStore } from "@/store/uploadStore"
import { useCallback } from "react"


export const useFileUpload = () => {
    const { uploadedFile, uploadProgress, addUploadedFile, setUploadProgress, clearFile, resetForNewFile } =
        useUploadStore()

    const handleFile = useCallback(
        async (file: File) => {
            // Reset everything for new file upload
            resetForNewFile()

            // Validate file type
            const allowedTypes = [
                "text/csv",
                "text/plain",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ]

            const allowedExtensions = [".csv", ".txt", ".xls", ".xlsx"]
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
                alert("Please upload a valid file (CSV, TXT, XLS, or XLSX)")
                return
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024 // 10MB
            if (file.size > maxSize) {
                alert("File size must be less than 10MB")
                return
            }

            // Add the file to store
            await addUploadedFile(file)

            // Simulate upload progress
            let progress = 0
            const interval = setInterval(() => {
                progress += Math.random() * 15 + 5 // Random progress between 5-20%
                if (progress >= 100) {
                    progress = 100
                    clearInterval(interval)
                }
                setUploadProgress(progress)
            }, 200)
        },
        [addUploadedFile, setUploadProgress, resetForNewFile],
    )

    const removeFile = useCallback(() => {
        clearFile()
    }, [clearFile])

    return {
        uploadedFile,
        uploadProgress,
        handleFile,
        removeFile,
    }
}
