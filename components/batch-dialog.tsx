"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createBatch, updateBatch } from "@/app/actions/batches"

interface BatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: { id: string; name: string }
  onSuccess?: () => void
}

export function BatchDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: BatchDialogProps) {
  const [name, setName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  const isEdit = !!initialData

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "")
      setError(null)
      setIsSubmitting(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    const trimmed = name.trim()
    
    // Client validation
    if (!trimmed) {
      setError("Batch name is required")
      return
    }
    if (trimmed.length > 100) {
      setError("Batch name must be 100 characters or less")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set("name", trimmed)
      if (initialData?.id) {
        formData.set("id", initialData.id)
      }

      const result = isEdit 
        ? await updateBatch(null, formData)
        : await createBatch(null, formData)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      onOpenChange(false)
      onSuccess?.()
    } catch {
      setError("An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Batch" : "Add Batch"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the batch name" : "Create a new batch"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="batch-name">Batch Name</FieldLabel>
              <FieldContent>
                <Input
                  ref={inputRef}
                  id="batch-name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="2024-2025"
                  maxLength={100}
                  disabled={isSubmitting}
                  aria-invalid={!!error}
                  aria-describedby={error ? "batch-error" : undefined}
                  autoComplete="off"
                />
              </FieldContent>
              {error && (
                <FieldError id="batch-error">{error}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" className="mr-2" />}
              {isEdit ? "Save Changes" : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
