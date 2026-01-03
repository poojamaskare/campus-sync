"use client"

import * as React from "react"
import { getSubjects, deleteSubject } from "@/app/actions/subjects"
import { SubjectDialog } from "@/components/subject-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

interface Subject {
  id: string
  name: string
  shortName: string
}

function SubjectsList({
  subjects,
  onEdit,
  onDelete,
  deletingId,
}: {
  subjects: Subject[]
  onEdit: (subject: Subject) => void
  onDelete: (subject: Subject) => void
  deletingId: string | null
}) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No subjects found. Click "Add Subject" to create one.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {subjects.map((subject) => (
        <Card key={subject.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{subject.name}</div>
              <div className="text-sm text-muted-foreground">{subject.shortName}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(subject)}
                disabled={!!deletingId}
                aria-label="Edit subject"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(subject)}
                disabled={deletingId === subject.id}
                aria-label="Delete subject"
              >
                {deletingId === subject.id ? (
                  <Spinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [subjectToDelete, setSubjectToDelete] = React.useState<Subject | null>(null)

  const loadSubjects = React.useCallback(async () => {
    try {
      const data = await getSubjects()
      setSubjects(data)
    } catch (error) {
      console.error("Failed to load subjects:", error)
    }
  }, [])

  React.useEffect(() => {
    loadSubjects().finally(() => setLoading(false))
  }, [loadSubjects])

  const handleAdd = () => {
    setEditingSubject(null)
    setDialogOpen(true)
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setDialogOpen(true)
  }

  const handleDeleteClick = (subject: Subject) => {
    setSubjectToDelete(subject)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return

    const id = subjectToDelete.id
    setDeletingId(id)
    setDeleteDialogOpen(false)

    const result = await deleteSubject(id)
    if (result.success) {
      setSubjects((prev) => prev.filter((s) => s.id !== id))
    } else {
      await loadSubjects()
    }
    setDeletingId(null)
    setSubjectToDelete(null)
  }

  const handleDialogSuccess = () => {
    loadSubjects()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-muted-foreground text-sm">Manage subjects</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <SubjectsList
        subjects={subjects}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        deletingId={deletingId}
      />

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingSubject ?? undefined}
        onSuccess={handleDialogSuccess}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This action cannot be undone."
        itemName={subjectToDelete?.name}
        isDeleting={!!deletingId}
      />
    </div>
  )
}

