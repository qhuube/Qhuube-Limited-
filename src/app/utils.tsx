import { FileText, File } from "lucide-react"

export function getFileIcon(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase()

  const iconProps = { className: "w-5 h-5 text-sky-600 flex-shrink-0" }

  switch (extension) {
    case "csv":
      return <FileText {...iconProps} />
    case "xls":
    case "xlsx":
      return <FileText {...iconProps} />
    default:
      return <File {...iconProps} />
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
