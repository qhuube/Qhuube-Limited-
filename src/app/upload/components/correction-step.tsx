/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Download,
  Info,
  XCircle,
  AlertCircle,
  Database,
  Type,
  ChevronDown,
  ChevronRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CorrectionStepProps, ValidationIssue } from "@/app/types";
import axios from "axios";
import { useUploadStore } from "@/store/uploadStore";
import { toast } from "sonner";

export default function CorrectionStep({
  onNext,
  onPrevious,
}: CorrectionStepProps) {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedQuarterIssues, setExpandedQuarterIssues] = useState<
    Set<number>
  >(new Set());
  const [userEmail, setUserEmail] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { uploadedFile, sessionId, setSessionId } = useUploadStore();
  const allIssuesResolved = issues.every((issue) => issue.status !== "pending");
  const hasQuarterIssues = issues.some(
    (issue) => issue.details?.issueType === "INVALID_QUARTER"
  );

  const validateFilesAndCreateSessions = useCallback(async () => {
    if (!uploadedFile) {
      console.log("No file to validate");
      return;
    }

    setIsLoading(true);
    setValidationError(null);

    try {
      const formData = new FormData();

      if (!(uploadedFile.file instanceof File)) {
        throw new Error("Invalid file object. Please re-upload your file.");
      }

      formData.append("files", uploadedFile.file, uploadedFile.name);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/validate-file`,
        formData,
        {
          headers: { Accept: "application/json" },
        }
      );

      console.log("Validation Result:", response.data);
      // setValidationSummary(response.data)

      if (response.data.files?.[0]?.session_id) {
        setSessionId(response.data.files[0].session_id);
        console.log("Session ID set:", response.data.files[0].session_id);
      }

      const transformedIssues: ValidationIssue[] = [];
      let issueId = 1;

      const fileResult = response.data.files?.[0];
      if (fileResult?.has_issues && fileResult.validation_result) {
        const { validation_result } = fileResult;

        validation_result.missing_headers_detailed?.forEach(
          (headerIssue: any) => {
            transformedIssues.push({
              id: issueId++,
              invoiceNumber: fileResult.file_name,
              invoiceDate: new Date().toISOString().split("T")[0],
              taxCode: "N/A",
              vatAmount: 0,
              currency: "EUR",
              issueType: `Missing Column: ${headerIssue.header_label}`,
              originalValue: "Column not found",
              suggestedValue: `Add '${headerIssue.header_label}' column`,
              status: "pending",
              severity: "High",
              details: {
                columnName: headerIssue.header_label,
                description: headerIssue.description,
                expectedType: "column",
              },
            });
          }
        );

        validation_result.data_issues?.forEach((dataIssue: any) => {
          const isInvalidType = dataIssue.issue_type === "INVALID_TYPE";
          const isMissingData = dataIssue.issue_type === "MISSING_DATA";
          const isInvalidQuarter = dataIssue.issue_type === "INVALID_QUARTER";

          let issueTypeLabel = "";
          let originalValue = "";
          let suggestedValue = "";
          let severity: "High" | "Medium" | "Low" = "Low";

          if (isInvalidType) {
            issueTypeLabel = `Incorrect Information in "${dataIssue.column_name}"`;
            originalValue = `${dataIssue.invalid_count} value(s) don't match the expected format`;
            suggestedValue = `Ensure values in "${dataIssue.column_name}" follow the correct ${dataIssue.expected_type} format`;
            severity =
              dataIssue.percentage > 50
                ? "High"
                : dataIssue.percentage > 20
                ? "Medium"
                : "Low";
          } else if (isMissingData) {
            issueTypeLabel = `Missing Information in "${dataIssue.column_name}"`;
            originalValue = `${dataIssue.total_missing} missing or empty value(s)`;
            suggestedValue = `Please provide the missing data in "${dataIssue.column_name}"`;
            severity =
              dataIssue.percentage > 50
                ? "High"
                : dataIssue.percentage > 20
                ? "Medium"
                : "Low";
          } else if (isInvalidQuarter) {
            issueTypeLabel = `Invalid Quarter in "${
              dataIssue.header_label || dataIssue.column_name
            }"`;
            originalValue = `${dataIssue.invalid_count} date(s) outside allowed quarter range`;
            suggestedValue = `Ensure dates in "${
              dataIssue.header_label || dataIssue.column_name
            }" are within the previous quarter`;
            severity = "High"; // Always set High severity for INVALID_QUARTER
          }

          transformedIssues.push({
            id: issueId++,
            invoiceNumber: fileResult.file_name,
            invoiceDate: new Date().toISOString().split("T")[0],
            taxCode: "N/A",
            vatAmount: 0,
            currency: "EUR",
            issueType: issueTypeLabel,
            originalValue: originalValue,
            suggestedValue: suggestedValue,
            status: "pending",
            severity: severity,
            details: {
              columnName: dataIssue.column_name || dataIssue.header_value,
              headerLabel: dataIssue.header_label,
              dataType: dataIssue.data_type,
              missingRows: dataIssue.missing_rows,
              invalidRows: dataIssue.invalid_rows?.map((row: any) => ({
                rowNumber: row.row,
                value: row.value,
                issue: row.issue,
              })),
              hasMoreRows: dataIssue.has_more_rows,
              totalMissing: dataIssue.total_missing,
              totalRows: dataIssue.total_rows,
              invalidCount: dataIssue.invalid_count,
              percentage: dataIssue.percentage,
              description: dataIssue.issue_description,
              expectedType: dataIssue.expected_type,
              issueType: dataIssue.issue_type,
            },
          });
        });
      }

      setIssues(transformedIssues);
    } catch (err: any) {
      console.error("Validation error:", err.response?.data || err.message);
      let errorMessage = "Validation failed";

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          if (Array.isArray(err.response.data.detail)) {
            errorMessage = err.response.data.detail
              .map((error: any) => {
                if (typeof error === "string") return error;
                if (error.msg)
                  return `${error.loc?.join(".") || "Field"}: ${error.msg}`;
                return JSON.stringify(error);
              })
              .join(", ");
          } else {
            errorMessage = err.response.data.detail;
          }
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setValidationError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, setSessionId]);

  useEffect(() => {
    validateFilesAndCreateSessions();
  }, [validateFilesAndCreateSessions]);

  const downloadCorrectionReviewFile = async (fileName: string) => {
    try {
      if (!sessionId) {
        alert("Session not found for this file");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/download-vat-issues/${sessionId}`,
        {
          responseType: "blob",
        }
      );

      const blob = response.data;
      let filename = "correction_review.xlsx";

      const cd = response.headers["content-disposition"];
      if (cd) {
        const match = cd.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      } else {
        filename = fileName.replace(/\.[^.]+$/, "") + "_correction_review.xlsx";
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download VAT report");
    }
  };

  const sendAdminNotification = async () => {
    if (!userEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!userEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!sessionId) {
      toast.error("Session not found. Please try uploading your file again.");
      return;
    }

    setIsEmailSending(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notify-admin-quarter-issues`,
        {
          userEmail,
          sessionId,
        }
      );

      if (response.status === 200) {
        setEmailSent(true);
        toast.success(
          "Admin notification sent successfully! You will be contacted regarding the quarter validation issues."
        );
      }
    } catch (error: any) {
      console.error("Failed to send admin notification:", error);
      toast.error(
        "Failed to send notification. Please try again or contact support directly."
      );
    } finally {
      setIsEmailSending(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Low":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "corrected":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "ignored":
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getIssueTypeIcon = (issueType: string) => {
    if (issueType.includes("Missing Column")) {
      return <Database className="w-4 h-4 text-red-500" />;
    } else if (issueType.includes("Missing Information")) {
      return <XCircle className="w-4 h-4 text-orange-500" />;
    } else if (issueType.includes("Incorrect Information")) {
      return <Type className="w-4 h-4 text-purple-500" />;
    } else if (issueType.includes("Invalid Quarter")) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-500" />;
  };

  const toggleQuarterDetails = (issueId: number) => {
    const newExpanded = new Set(expandedQuarterIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedQuarterIssues(newExpanded);
  };

  const renderQuarterSummary = (issue: ValidationIssue) => {
    if (
      !issue.details?.invalidRows ||
      issue.details.issueType !== "INVALID_QUARTER"
    ) {
      return null;
    }

    const invalidRows = issue.details.invalidRows;
    const isExpanded = expandedQuarterIssues.has(issue.id);

    return (
      <div className="text-xs space-y-2">
        <button
          onClick={() => toggleQuarterDetails(issue.id)}
          className="flex items-center gap-1 text-sky-600 hover:text-sky-800 font-medium"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          View {invalidRows.length} invalid date
          {invalidRows.length > 1 ? "s" : ""}
        </button>

        {isExpanded && (
          <div className="bg-red-50 p-2 rounded border-l-2 border-red-200 space-y-1">
            {invalidRows.slice(0, 5).map((row: any, index: number) => (
              <div key={index} className="text-xs">
                <span className="font-mono text-red-700">
                  Row {row.rowNumber}:
                </span>
                <span className="ml-2 text-red-600">{row.value}</span>
                <div className="text-red-500 text-xs italic ml-4">
                  {row.issue}
                </div>
              </div>
            ))}
            {invalidRows.length > 5 && (
              <div className="text-xs text-red-600 italic">
                ...and {invalidRows.length - 5} more invalid dates
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6">
          {/* Use Tailwind's built-in animation */}
          <div className="h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">
              Validating your file...
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-md">
              We&apos;re checking your uploaded file for formatting and data
              issues. This may take a few moments.
            </p>
          </div>
        </div>
      </div>
    );
  }
  

  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl text-center">
          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Validation Error
          </h1>

          {/* Alert Box */}
          <Alert className="mb-6 text-left">
            <AlertTriangle className="h-5 w-5 shrink-0 mr-2 text-red-500" />
            <AlertDescription className="break-words">
              {validationError}
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={onPrevious}
              className="flex items-center gap- bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={validateFilesAndCreateSessions}
              className=" hover:bg-sky-800"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 md:mt-16 lg:mt-16 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto mt-16 xl:mt-4">
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Tax Correction Issues
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review and address the data quality issues found in your uploaded
              file
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 lg:mb-8">
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-sky-600" />
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-semibold text-gray-900">
                    1
                  </div>
                  <div className="text-sm text-gray-600">File Processed</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-xl lg:text-2xl font-semibold text-red-600">
                    {issues.reduce((total, issue) => {
                      return total + (issue.details?.invalidRows?.length || 0);
                    }, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Issues</div>
                </div>
              </div>
            </div>
          </div>

          {uploadedFile && issues.length > 0 && (
            <div className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200 shadow-sm mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Download Highlighted Issues
                  </h3>
                  <p className="text-sm text-gray-600">
                    {issues.length === 0
                      ? "Download your validated file and report"
                      : !allIssuesResolved
                      ? "Download your highlighted issues and validation report"
                      : "Resolve all issues to download corrected file"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadCorrectionReviewFile(uploadedFile.name)
                    }
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Download className="w-4 h-4" />
                    {uploadedFile.name}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {issues.length === 0 && (
            <div className="rounded-lg p-6 mb-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Validation Successful!
              </h3>
              <p className="text-green-700 mb-4">
                Your file has been validated successfully with no data quality
                issues found.
              </p>
            </div>
          )}

          <div className="md:hidden space-y-3 mb-6">
            {issues.map((issue) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      {getIssueTypeIcon(issue.issueType)}
                      {getStatusIcon(issue.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {issue.issueType}
                        </h4>
                        <Badge
                          className={`text-xs px-2 py-0.5 ${getSeverityColor(
                            issue.severity
                          )}`}
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>File: {issue.invoiceNumber}</div>
                      </div>
                    </div>
                  </div>
                  {issue.details && (
                    <div className="bg-sky-50 p-3 rounded-lg text-xs">
                      <div className="flex items-center gap-1 mb-2">
                        <Info className="w-3 h-3 text-sky-600" />
                        <span className="font-medium text-sky-900">
                          Issue Details:
                        </span>
                      </div>
                      <div className="space-y-1 text-sky-800">
                        {issue.details.dataType && (
                          <div>Data Type: {issue.details.dataType}</div>
                        )}
                        {issue.details.expectedType && (
                          <div>Expected: {issue.details.expectedType}</div>
                        )}
                        {issue.details.description && (
                          <div>Description: {issue.details.description}</div>
                        )}
                        {issue.details.percentage && (
                          <div>
                            Affected: {issue.details.percentage}% of data
                          </div>
                        )}

                        {issue.details.invalidRows &&
                          issue.details.issueType === "INVALID_QUARTER" && (
                            <div className="mt-2">
                              <div className="font-medium text-sky-900 mb-1">
                                {issue.details.invalidRows.length} Invalid Date
                                {issue.details.invalidRows.length > 1
                                  ? "s"
                                  : ""}{" "}
                                Found
                              </div>
                              {renderQuarterSummary(issue)}
                            </div>
                          )}

                        {issue.details.missingRows && (
                          <div>
                            Rows:{" "}
                            {issue.details.missingRows.slice(0, 5).join(", ")}
                            {issue.details.hasMoreRows ? "..." : ""}
                          </div>
                        )}
                        {issue.details.invalidRows &&
                          issue.details.issueType !== "INVALID_QUARTER" && (
                            <div>
                              Invalid Rows:{" "}
                              {issue.details.invalidRows.slice(0, 5).join(", ")}
                              {issue.details.hasMoreRows ? "..." : ""}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">
                      Suggested Fix:
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="flex-1">
                        <div className="text-red-600 font-mono bg-red-50 px-2 py-1 rounded text-xs mb-1">
                          Issue: {issue.originalValue || "—"}
                        </div>
                        <div className="text-green-600 font-mono bg-green-50 px-2 py-1 rounded text-xs">
                          Fix: {issue.suggestedValue}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className={`hidden md:block bg-white mb-6 overflow-hidden rounded-lg ${
              issues.length > 0 ? "border border-gray-200" : ""
            }`}
          >
            <div
              className={`${
                issues.length > 5 ? "max-h-[400px] overflow-y-auto" : ""
              }`}
            >
              <Table>
                {issues.length > 0 && (
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-900 text-sm">
                        Issue Type
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-sm">
                        File & Details
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-sm">
                        Problem Summary
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-sm">
                        Suggested Fix
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-sm">
                        Severity
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                )}
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow
                      key={issue.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          {getIssueTypeIcon(issue.issueType)}
                          <div className="font-medium text-gray-900 text-sm">
                            {issue.issueType}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-900 font-medium mb-1">
                          {issue.invoiceNumber}
                        </div>
                        {issue.details && (
                          <div className="text-xs space-y-1">
                            {issue.details.dataType && (
                              <div className="text-gray-600">
                                Type: {issue.details.dataType}
                              </div>
                            )}
                            {issue.details.expectedType && (
                              <div className="text-gray-600">
                                Expected: {issue.details.expectedType}
                              </div>
                            )}
                            {/* {issue.details.description && (
                              <div className="text-gray-600">Issue: {issue.details.description}</div>
                            )} */}
                            {/* {issue.details.percentage && (
                              <div className="text-gray-600">Affected: {issue.details.percentage}%</div>
                            )} */}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm">
                          {issue.details?.issueType === "INVALID_QUARTER" ? (
                            <div className="space-y-2">
                              <div className="text-red-600 font-mono bg-red-50 w-fit px-2 py-1 rounded text-xs">
                                {issue.details.invalidCount} invalid dates found
                              </div>
                              {renderQuarterSummary(issue)}
                            </div>
                          ) : (
                            <>
                              <div className="text-red-600 font-mono bg-red-50 w-fit px-2 py-1 rounded text-xs mb-1">
                                {issue.originalValue || "—"}
                              </div>
                              {issue.details &&
                                (issue.details.missingRows ||
                                  issue.details.invalidRows) && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Rows:{" "}
                                    {(
                                      issue.details.missingRows ||
                                      issue.details.invalidRows
                                    )
                                      ?.slice(0, 3)
                                      .join(", ")}
                                    {issue.details.hasMoreRows ? "..." : ""}
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-green-600 font-mono bg-green-50 w-fit px-2 py-1 rounded text-xs">
                          {issue.suggestedValue}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={`text-xs px-2 py-1 ${getSeverityColor(
                            issue.severity
                          )}`}
                        >
                          {issue.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Quarter Validation Issues Banner */}
          {hasQuarterIssues && !emailSent && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="shadow-sm rounded-xl mb-6 lg:mb-8"
            >
              <div className="bg-white rounded-lg border border-sky-400 p-5 shadow-inner">
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Your Email Address
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm"
                    disabled={isEmailSending}
                  />
                  <Button
                    onClick={sendAdminNotification}
                    disabled={isEmailSending || !userEmail.trim()}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 h-auto whitespace-nowrap rounded-lg shadow-sm transition-colors"
                  >
                    {isEmailSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Notify Admin
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  We&apos;ll send your file details securely to an
                  administrator, who will reach out to help resolve the quarter
                  validation issues.
                </p>
              </div>
            </motion.div>
          )}

          {/* Success Banner */}
          {hasQuarterIssues && emailSent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-md p-3 mb-10 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Admin notification sent. You will be contacted at{" "}
                <span className="font-semibold">{userEmail}</span>.
              </p>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              className="w-full cursor-pointer sm:w-auto h-10 bg-transparent flex items-center justify-center px-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            {!allIssuesResolved && issues.length > 0 ? (
              <div
                title={`Resolve ${issues.reduce((total, issue) => {
                  return total + (issue.details?.invalidRows?.length || 0);
                }, 0)} issues first`}
                className="w-full sm:w-auto"
              >
                <Button
                  className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white h-10 px-6 opacity-50 cursor-not-allowed"
                  disabled={true}
                  onClick={onNext}
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white h-10 px-6"
                disabled={false}
                onClick={onNext}
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
