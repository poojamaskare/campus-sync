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
import { joinGroup } from "@/app/actions/groups"

interface JoinGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function JoinGroupDialog({
  open,
  onOpenChange,
  onSuccess,
}: JoinGroupDialogProps) {
  const [code, setCode] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setCode("")
      setError(null)
      setIsSubmitting(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!code.trim()) {
      setError("Group code is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await joinGroup(code.trim().toUpperCase())

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Group</DialogTitle>
          <DialogDescription>
            Enter the group code shared with you to join
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="group-code">Group Code</FieldLabel>
              <FieldContent>
                <Input
                  ref={inputRef}
                  id="group-code"
                  name="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    if (error) setError(null)
                  }}
                  placeholder="ABCD1234"
                  maxLength={8}
                  disabled={isSubmitting}
                  autoComplete="off"
                  style={{ textTransform: "uppercase" }}
                />
              </FieldContent>
            </Field>

            {error && (
              <FieldError role="alert">
                {error}
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
              {isSubmitting ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
