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
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createTimetable, updateTimetable } from "@/app/actions/timetables"

interface TimetableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: { id: string; name: string; description: string | null }
  onSuccess?: () => void
}

export function TimetableDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: TimetableDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<{ name?: string; description?: string }>({})
  const nameInputRef = React.useRef<HTMLInputElement>(null)
  
  const isEdit = !!initialData

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "")
      setDescription(initialData?.description ?? "")
      setErrors({})
      setIsSubmitting(false)
      setTimeout(() => nameInputRef.current?.focus(), 50)
    }
  }, [open, initialData])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    const trimmedName = name.trim()

    if (!trimmedName) {
      newErrors.name = "Timetable name is required"
    } else if (trimmedName.length > 100) {
      newErrors.name = "Timetable name must be 100 characters or less"
    }

    if (description.trim().length > 500) {
      newErrors.description = "Description must be 500 characters or less"
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
      const data = {
        name: name.trim(),
        description: description.trim() || undefined
      }

      const result = isEdit 
        ? await updateTimetable(initialData.id, data)
        : await createTimetable(data)

      if (result.error) {
        setErrors({ name: result.error })
        setIsSubmitting(false)
        return
      }

      onOpenChange(false)
      onSuccess?.()
    } catch {
      setErrors({ name: "An unexpected error occurred. Please try again." })
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Timetable" : "Create Timetable"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the timetable details below."
              : "Create a new timetable. You can add slots after creating it."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="timetable-name">Name</FieldLabel>
              <FieldContent>
                <Input
                  ref={nameInputRef}
                  id="timetable-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g., Semester 1 - 2026"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name}
                />
              </FieldContent>
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="timetable-description">Description (Optional)</FieldLabel>
              <FieldContent>
                <Textarea
                  id="timetable-description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
                  }}
                  placeholder="Add a description for this timetable..."
                  disabled={isSubmitting}
                  aria-invalid={!!errors.description}
                  rows={3}
                />
              </FieldContent>
              {errors.description && <FieldError>{errors.description}</FieldError>}
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {isEdit ? "Save Changes" : "Create Timetable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
