"use client"

import * as React from "react"
import { getBatches, deleteBatch } from "@/app/actions/batches"
import { BatchDialog } from "@/components/batch-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

interface Batch {
  id: string
  name: string
}

function BatchesList({
  batches,
  onEdit,
  onDelete,
  deletingId,
}: {
  batches: Batch[]
  onEdit: (batch: Batch) => void
  onDelete: (batch: Batch) => void
  deletingId: string | null
}) {
  if (batches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No batches found. Click "Add Batch" to create one.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {batches.map((batch) => (
        <Card key={batch.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="font-medium">{batch.name}</div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(batch)}
                disabled={!!deletingId}
                aria-label="Edit batch"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(batch)}
                disabled={deletingId === batch.id}
                aria-label="Delete batch"
              >
                {deletingId === batch.id ? (
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

export default function BatchesPage() {
  const [batches, setBatches] = React.useState<Batch[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingBatch, setEditingBatch] = React.useState<Batch | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [batchToDelete, setBatchToDelete] = React.useState<Batch | null>(null)

  const loadBatches = React.useCallback(async () => {
    try {
      const data = await getBatches()
      setBatches(data)
    } catch (error) {
      console.error("Failed to load batches:", error)
    }
  }, [])

  React.useEffect(() => {
    loadBatches().finally(() => setLoading(false))
  }, [loadBatches])

  const handleAdd = () => {
    setEditingBatch(null)
    setDialogOpen(true)
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setDialogOpen(true)
  }

  const handleDeleteClick = (batch: Batch) => {
    setBatchToDelete(batch)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return

    const id = batchToDelete.id
    setDeletingId(id)
    setDeleteDialogOpen(false)

    const result = await deleteBatch(id)
    if (result.success) {
      setBatches((prev) => prev.filter((b) => b.id !== id))
    } else {
      // Refresh on error to get correct state
      await loadBatches()
    }
    setDeletingId(null)
    setBatchToDelete(null)
  }

  const handleDialogSuccess = () => {
    loadBatches()
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
                <Skeleton className="h-6 w-32" />
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
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-muted-foreground text-sm">Manage batches</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Batch
        </Button>
      </div>

      <BatchesList
        batches={batches}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        deletingId={deletingId}
      />

      <BatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingBatch ?? undefined}
        onSuccess={handleDialogSuccess}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Batch"
        description="Are you sure you want to delete this batch? This action cannot be undone."
        itemName={batchToDelete?.name}
        isDeleting={!!deletingId}
      />
    </div>
  )
}
