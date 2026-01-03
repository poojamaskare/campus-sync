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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createGroup, updateGroup } from "@/app/actions/groups"
import { GroupRole } from "@prisma/client"

interface GroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id: string
    title: string
    description: string
    defaultRole: GroupRole
  }
  onSuccess?: () => void
}

export function GroupDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: GroupDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [defaultRole, setDefaultRole] = React.useState<GroupRole>("Viewer")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  const isEdit = !!initialData

  React.useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "")
      setDescription(initialData?.description ?? "")
      setDefaultRole(initialData?.defaultRole ?? "Viewer")
      setError(null)
      setIsSubmitting(false)
      setTimeout(() => titleInputRef.current?.focus(), 50)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!title.trim()) {
      setError("Group title is required")
      return
    }
    if (!description.trim()) {
      setError("Group description is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set("title", title.trim())
      formData.set("description", description.trim())
      formData.set("defaultRole", defaultRole)
      if (initialData?.id) {
        formData.set("id", initialData.id)
      }

      const result = isEdit
        ? await updateGroup(null, formData)
        : await createGroup(null, formData)

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
          <DialogTitle>{isEdit ? "Edit Group" : "Create Group"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the group details"
              : "Create a new group and share the code with others"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="group-title">Title</FieldLabel>
              <FieldContent>
                <Input
                  ref={titleInputRef}
                  id="group-title"
                  name="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="My Group"
                  maxLength={100}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="group-description">Description</FieldLabel>
              <FieldContent>
                <Textarea
                  id="group-description"
                  name="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Describe the purpose of this group..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="group-default-role">Default Role for New Members</FieldLabel>
              <FieldContent>
                <Select
                  value={defaultRole}
                  onValueChange={(value) => setDefaultRole(value as GroupRole)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="group-default-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
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
