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
import { createRoom, updateRoom } from "@/app/actions/rooms"

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: { id: string; number: string }
  onSuccess?: () => void
}

export function RoomDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: RoomDialogProps) {
  const [number, setNumber] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  const isEdit = !!initialData

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setNumber(initialData?.number ?? "")
      setError(null)
      setIsSubmitting(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    const trimmed = number.trim()
    
    // Client validation
    if (!trimmed) {
      setError("Room number is required")
      return
    }
    if (trimmed.length > 50) {
      setError("Room number must be 50 characters or less")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set("number", trimmed)
      if (initialData?.id) {
        formData.set("id", initialData.id)
      }

      const result = isEdit 
        ? await updateRoom(null, formData)
        : await createRoom(null, formData)

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
          <DialogTitle>{isEdit ? "Edit Room" : "Add Room"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the room number" : "Create a new room"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="room-number">Room Number</FieldLabel>
              <FieldContent>
                <Input
                  ref={inputRef}
                  id="room-number"
                  name="number"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="101"
                  maxLength={50}
                  disabled={isSubmitting}
                  aria-invalid={!!error}
                  aria-describedby={error ? "room-error" : undefined}
                  autoComplete="off"
                />
              </FieldContent>
              {error && (
                <FieldError id="room-error" role="alert">
                  {error}
                </FieldError>
              )}
            </Field>
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
