/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState } from "react"
import { FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as XLSX from "xlsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EU_COUNTRIES, VAT_CATEGORIES } from "@/lib/countries"
import { toast } from "sonner"
import axiosInstance from "@/lib/axiosInstance"

// VAT Categories


interface TaxRule {
    id: string
    product_type: string
    country: string
    vat_rate: number
    vat_category: string
    shipping_vat_rate: number
}

interface ImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImportSuccess: (rules: TaxRule[]) => void
}

const ImportDialog = ({ open, onOpenChange, onImportSuccess }: ImportDialogProps) => {
    const [isImporting, setIsImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const [importResults, setImportResults] = useState<{
        success: number
        errors: string[]
        total: number
    } | null>(null)


    // Accept both user-friendly and backend field names
    const getField = (row: any, keys: string[]) => {
        for (const key of keys) {
            if (row[key] !== undefined) return row[key];
        }
        return undefined;
    };

    const validateImportRow = (row: any, rowIndex: number): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        const productType = getField(row, ["product_type", "Product Type"]);
        const country = getField(row, ["country", "Country"]);
        const vatCategory = getField(row, ["vat_category", "VAT Category"]);
        const vatRate = getField(row, ["vat_rate", "VAT Rate"]);
        const shippingVatRate = getField(row, ["shipping_vat_rate", "Shipping VAT Rate"]);

        if (!productType || typeof productType !== "string") {
            errors.push(`Row ${rowIndex + 1}: Product type is required`);
        }

        if (!country || !EU_COUNTRIES.includes(country)) {
            errors.push(`Row ${rowIndex + 1}: Valid EU country is required`);
        }

        if (!vatCategory || !VAT_CATEGORIES.includes(vatCategory)) {
            errors.push(`Row ${rowIndex + 1}: Valid VAT category is required`);
        }

        if (isNaN(Number(vatRate)) || Number(vatRate) < 0 || Number(vatRate) > 100) {
            errors.push(`Row ${rowIndex + 1}: VAT rate must be a number between 0 and 100`);
        }

        if (isNaN(Number(shippingVatRate)) || Number(shippingVatRate) < 0 || Number(shippingVatRate) > 100) {
            errors.push(`Row ${rowIndex + 1}: Shipping VAT rate must be a number between 0 and 100`);
        }

        return { isValid: errors.length === 0, errors };
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportProgress(0);
        setImportResults(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            setImportProgress(25);

            const validRows: TaxRule[] = [];
            const allErrors: string[] = [];

            jsonData.forEach((row: any, index: number) => {
                const validation = validateImportRow(row, index);

                if (validation.isValid) {
                    validRows.push({
                        id: `import_${Date.now()}_${index}`,
                        product_type: getField(row, ["product_type", "Product Type"]),
                        country: getField(row, ["country", "Country"]),
                        vat_rate: Number(getField(row, ["vat_rate", "VAT Rate"])),
                        vat_category: getField(row, ["vat_category", "VAT Category"]),
                        shipping_vat_rate: Number(getField(row, ["shipping_vat_rate", "Shipping VAT Rate"])),
                    });
                } else {
                    allErrors.push(...validation.errors);
                }

                setImportProgress(25 + (index / jsonData.length) * 50);
            });

            setImportProgress(75);

            // Send valid rows to API
            if (validRows.length > 0) {
                try {
                    const response = await axiosInstance.post("/imports/products/json", {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        products: validRows.map(({ id, ...rest }) => rest), // remove frontend-generated id
                    });

                    toast.success(`Saved ${response.data.imported} tax rules to the database.`);
                } catch (err) {
                    console.error("Failed to import to server:", err);
                    toast.error("Failed to save imported tax rules to server.");
                }

                // Optionally also pass to parent if needed
                onImportSuccess(validRows);
            }

            setImportProgress(100);
            setImportResults({
                success: validRows.length,
                errors: allErrors,
                total: jsonData.length,
            });

            if (validRows.length > 0) {
                toast.success(`Successfully imported ${validRows.length} tax rules.`);
            }

            if (allErrors.length > 0) {
                toast.error(`${allErrors.length} errors found. Check the results below.`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setImportResults({
                success: 0,
                errors: [`Failed to parse Excel file: ${errorMessage}`],
                total: 0,
            });

            toast.error(`Failed to process Excel file: ${errorMessage}`);
        } finally {
            setIsImporting(false);
            event.target.value = "";
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                product_type: "Electronics",
                country: "Germany",
                vat_rate: 19,
                vat_category: "Standard",
                shipping_vat_rate: 19,
            },
            {
                product_type: "Books",
                country: "France",
                vat_rate: 5.5,
                vat_category: "Reduced",
                shipping_vat_rate: 20,
            },
        ]

        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Tax Rules Template")
        XLSX.writeFile(wb, "tax_rules_template.xlsx")

        toast.success("Template Downloaded")
    }

    const handleClose = () => {
        setImportResults(null)
        setImportProgress(0)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {/* <FileSpreadsheet className="h-5 w-5" /> */}
                        Import Tax Rules from Excel
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Template Download */}
                    <div className="space-y-2">
                        <Label>Download Template</Label>
                        <p className="text-sm text-muted-foreground">Download the Excel template with the correct column format</p>
                        <Button variant="outline" onClick={downloadTemplate}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Download Template
                        </Button>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="excel-upload">Upload Excel File</Label>
                        <p className="text-sm text-muted-foreground">Select an Excel file (.xlsx, .xls) with tax rules data</p>
                        <Input
                            id="excel-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileImport}
                            disabled={isImporting}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Progress */}
                    {isImporting && (
                        <div className="space-y-2">
                            <Label>Import Progress</Label>
                            <Progress value={importProgress} className="w-full" />
                            <p className="text-sm text-muted-foreground">Processing... {Math.round(importProgress)}%</p>
                        </div>
                    )}

                    {/* Results */}
                    {importResults && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                {importResults.success > 0 ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                                <Label>Import Results</Label>
                            </div>

                            {importResults.success > 0 && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Successfully imported {importResults.success} out of {importResults.total} tax rules.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {importResults.errors.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-1">
                                            <p className="font-medium">{importResults.errors.length} error(s) found:</p>
                                            <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto">
                                                {importResults.errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="space-y-2">
                        <Label>Excel Format Requirements</Label>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>Your Excel file should contain the following columns:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>
                                    <strong>Product Type</strong>: Product category name (Electronics, Books, etc.)
                                </li>
                                <li>
                                    <strong>Country</strong>: EU country name (exact match required)
                                </li>
                                <li>
                                   <strong>VAT Rate</strong>: VAT percentage (0-100)
                                </li>
                                <li>
                                    <strong>VAT Category</strong>: One of: {VAT_CATEGORIES.join(", ")}
                                </li>
                                <li>
                                    <strong>Shipping VAT Rate</strong>: Shipping VAT percentage (0-100)
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ImportDialog
