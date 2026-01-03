"use client"

import * as React from "react"
import { getRooms, deleteRoom } from "@/app/actions/rooms"
import { RoomDialog } from "@/components/room-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

interface Room {
  id: string
  number: string
}

function RoomsList({
  rooms,
  onEdit,
  onDelete,
  deletingId,
}: {
  rooms: Room[]
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
  deletingId: string | null
}) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No rooms found. Click "Add Room" to create one.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card key={room.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="font-medium">{room.number}</div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(room)}
                disabled={!!deletingId}
                aria-label="Edit room"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(room)}
                disabled={deletingId === room.id}
                aria-label="Delete room"
              >
                {deletingId === room.id ? (
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

export default function RoomsPage() {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [roomToDelete, setRoomToDelete] = React.useState<Room | null>(null)

  const loadRooms = React.useCallback(async () => {
    try {
      const data = await getRooms()
      setRooms(data)
    } catch (error) {
      console.error("Failed to load rooms:", error)
    }
  }, [])

  React.useEffect(() => {
    loadRooms().finally(() => setLoading(false))
  }, [loadRooms])

  const handleAdd = () => {
    setEditingRoom(null)
    setDialogOpen(true)
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setDialogOpen(true)
  }

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return

    const id = roomToDelete.id
    setDeletingId(id)
    setDeleteDialogOpen(false)

    const result = await deleteRoom(id)
    if (result.success) {
      setRooms((prev) => prev.filter((r) => r.id !== id))
    } else {
      // Refresh on error to get correct state
      await loadRooms()
    }
    setDeletingId(null)
    setRoomToDelete(null)
  }

  const handleDialogSuccess = () => {
    loadRooms()
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
                <Skeleton className="h-6 w-24" />
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
          <h1 className="text-2xl font-bold">Rooms</h1>
          <p className="text-muted-foreground text-sm">Manage rooms</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </div>

      <RoomsList
        rooms={rooms}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        deletingId={deletingId}
      />

      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingRoom ?? undefined}
        onSuccess={handleDialogSuccess}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Room"
        description="Are you sure you want to delete this room? This action cannot be undone."
        itemName={roomToDelete?.number}
        isDeleting={!!deletingId}
      />
    </div>
  )
}

