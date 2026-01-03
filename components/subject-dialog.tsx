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
import { createSubject, updateSubject } from "@/app/actions/subjects"

interface SubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: { id: string; name: string; shortName: string }
  onSuccess?: () => void
}

export function SubjectDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: SubjectDialogProps) {
  const [name, setName] = React.useState("")
  const [shortName, setShortName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<{ name?: string; shortName?: string; general?: string }>({})
  const nameInputRef = React.useRef<HTMLInputElement>(null)
  
  const isEdit = !!initialData

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "")
      setShortName(initialData?.shortName ?? "")
      setErrors({})
      setIsSubmitting(false)
      setTimeout(() => nameInputRef.current?.focus(), 50)
    }
  }, [open, initialData])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    const trimmedName = name.trim()
    const trimmedShortName = shortName.trim().toUpperCase()

    if (!trimmedName) {
      newErrors.name = "Subject name is required"
    } else if (trimmedName.length > 100) {
      newErrors.name = "Subject name must be 100 characters or less"
    }

    if (!trimmedShortName) {
      newErrors.shortName = "Short name is required"
    } else if (trimmedShortName.length > 20) {
      newErrors.shortName = "Short name must be 20 characters or less"
    } else if (!/^[A-Z0-9\s.\-]+$/.test(trimmedShortName)) {
      newErrors.shortName = "Short name can only contain letters, numbers, spaces, hyphens, and periods"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!validate()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.set("name", name.trim())
      formData.set("shortName", shortName.trim().toUpperCase())
      if (initialData?.id) {
        formData.set("id", initialData.id)
      }

      const result = isEdit 
        ? await updateSubject(null, formData)
        : await createSubject(null, formData)

      if (result.error) {
        setErrors({ general: result.error })
        setIsSubmitting(false)
        return
      }

      onOpenChange(false)
      onSuccess?.()
    } catch {
      setErrors({ general: "An unexpected error occurred" })
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
          <DialogTitle>{isEdit ? "Edit Subject" : "Add Subject"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the subject details" : "Create a new subject"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="subject-name">Subject Name</FieldLabel>
              <FieldContent>
                <Input
                  ref={nameInputRef}
                  id="subject-name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="Mathematics"
                  maxLength={100}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "subject-name-error" : undefined}
                  autoComplete="off"
                />
              </FieldContent>
              {errors.name && (
                <FieldError id="subject-name-error" role="alert">
                  {errors.name}
                </FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="subject-short-name">Short Name</FieldLabel>
              <FieldContent>
                <Input
                  id="subject-short-name"
                  name="shortName"
                  value={shortName}
                  onChange={(e) => {
                    setShortName(e.target.value.toUpperCase())
                    if (errors.shortName) setErrors((prev) => ({ ...prev, shortName: undefined }))
                  }}
                  placeholder="MATH"
                  maxLength={20}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.shortName}
                  aria-describedby={errors.shortName ? "subject-short-name-error" : undefined}
                  autoComplete="off"
                  style={{ textTransform: "uppercase" }}
                />
              </FieldContent>
              {errors.shortName && (
                <FieldError id="subject-short-name-error" role="alert">
                  {errors.shortName}
                </FieldError>
              )}
            </Field>

            {errors.general && (
              <FieldError role="alert">
                {errors.general}
              </FieldError>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4">
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
              {isSubmitting 
                ? (isEdit ? "Updating..." : "Creating...") 
                : (isEdit ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
