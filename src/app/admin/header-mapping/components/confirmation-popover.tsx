"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { InternalHeader } from "./internal-header-management"

interface ConfirmationPopoverProps {
    header: InternalHeader
    onConfirm: () => void
    children: React.ReactNode
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
}

export function ConfirmationPopover({
    header,
    onConfirm,
    children,
    title = "Delete Header",
    description,
    confirmText = "Delete",
    cancelText = "Cancel",
    variant = "destructive",
}: ConfirmationPopoverProps) {
    const [open, setOpen] = useState(false)

    const handleConfirm = () => {
        onConfirm()
        setOpen(false)
    }
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{title}</h4>
                        <div className="text-sm text-muted-foreground">
                            {description ? (
                                <p>{description}</p>
                            ) : (
                                <>
                                    <p>
                                        Are you sure you want to delete the header{" "}
                                        <span className="font-medium">{header.label}</span>?
                                    </p>
                                    <p className="mt-1">This action cannot be undone and may affect existing mappings.</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                            {cancelText}
                        </Button>
                        <Button variant={variant} size="sm" onClick={handleConfirm}>
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
