"use client"

import * as React from "react"
import { getGroups, deleteGroup, leaveGroup } from "@/app/actions/groups"
import { getCurrentUser } from "@/app/actions/auth"
import { GroupDialog } from "@/components/group-dialog"
import { JoinGroupDialog } from "@/components/join-group-dialog"
import { ManageMembersDialog } from "@/components/manage-members-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Users, LogOut, UserPlus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { GroupRole } from "@prisma/client"

interface GroupForHOD {
  id: string
  title: string
  description: string
  code: string
  codeActive: boolean
  defaultRole: GroupRole
  createdAt: Date
  _count: { memberships: number }
}

interface GroupForMember {
  id: string
  title: string
  description: string
  code: string
  codeActive: boolean
  defaultRole: GroupRole
  createdAt: Date
  createdBy: { name: string }
  memberRole: GroupRole
  membershipId: string
}

type Group = GroupForHOD | GroupForMember

function isHODGroup(group: Group): group is GroupForHOD {
  return "_count" in group
}

function GroupCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function GroupsPage() {
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const [groups, setGroups] = React.useState<Group[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [joinDialogOpen, setJoinDialogOpen] = React.useState(false)
  const [editingGroup, setEditingGroup] = React.useState<GroupForHOD | null>(null)
  const [managingGroup, setManagingGroup] = React.useState<GroupForHOD | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [groupToDelete, setGroupToDelete] = React.useState<Group | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [leavingId, setLeavingId] = React.useState<string | null>(null)

  const isHOD = userRole === "HOD"

  const loadData = React.useCallback(async () => {
    try {
      const [user, groupsData] = await Promise.all([
        getCurrentUser(),
        getGroups(),
      ])
      setUserRole(user?.role ?? null)
      setGroups(groupsData as Group[])
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }, [])

  React.useEffect(() => {
    loadData().finally(() => setLoading(false))
  }, [loadData])

  const loadGroups = React.useCallback(async () => {
    try {
      const data = await getGroups()
      setGroups(data as Group[])
    } catch (error) {
      console.error("Failed to load groups:", error)
    }
  }, [])

  const handleAdd = () => {
    setEditingGroup(null)
    setDialogOpen(true)
  }

  const handleEdit = (group: GroupForHOD) => {
    setEditingGroup(group)
    setDialogOpen(true)
  }

  const handleManageMembers = (group: GroupForHOD) => {
    setManagingGroup(group)
  }

  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return

    const id = groupToDelete.id
    setDeletingId(id)
    setDeleteDialogOpen(false)

    const result = await deleteGroup(id)
    if (result.success) {
      setGroups((prev) => prev.filter((g) => g.id !== id))
    } else {
      await loadGroups()
    }
    setDeletingId(null)
    setGroupToDelete(null)
  }

  const handleLeaveGroup = async (group: GroupForMember) => {
    setLeavingId(group.id)
    const result = await leaveGroup(group.id)
    if (result.success) {
      setGroups((prev) => prev.filter((g) => g.id !== group.id))
    } else {
      await loadGroups()
    }
    setLeavingId(null)
  }

  const handleDialogSuccess = () => {
    loadGroups()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-muted-foreground text-sm">
            {isHOD ? "Create and manage groups" : "View groups you've joined"}
          </p>
        </div>
        <div className="flex gap-2">
          {!isHOD && (
            <Button onClick={() => setJoinDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Join Group
            </Button>
          )}
          {isHOD && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {isHOD
            ? 'No groups created yet. Click "Create Group" to get started.'
            : 'You haven\'t joined any groups yet. Click "Join Group" to join one.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                  {isHODGroup(group) ? (
                    <Badge variant="outline">
                      {group._count.memberships} members
                    </Badge>
                  ) : (
                    <Badge>{group.memberRole}</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {group.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {!isHODGroup(group) && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Created by {group.createdBy.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {isHODGroup(group) ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageMembers(group)}
                        disabled={!!deletingId}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Members
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(group)}
                        disabled={!!deletingId}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(group)}
                        disabled={deletingId === group.id}
                      >
                        {deletingId === group.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveGroup(group)}
                      disabled={leavingId === group.id}
                    >
                      {leavingId === group.id ? (
                        <Spinner size="sm" className="mr-1" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-1" />
                      )}
                      Leave
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isHOD && (
        <>
          <GroupDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            initialData={
              editingGroup
                ? {
                    id: editingGroup.id,
                    title: editingGroup.title,
                    description: editingGroup.description,
                    defaultRole: editingGroup.defaultRole,
                  }
                : undefined
            }
            onSuccess={handleDialogSuccess}
          />

          <ManageMembersDialog
            open={!!managingGroup}
            onOpenChange={(open) => !open && setManagingGroup(null)}
            group={managingGroup}
            onUpdate={loadGroups}
          />

          <DeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            title="Delete Group"
            description="Are you sure you want to delete this group? All members will be removed. This action cannot be undone."
            itemName={groupToDelete?.title}
            isDeleting={!!deletingId}
          />
        </>
      )}

      {!isHOD && (
        <JoinGroupDialog
          open={joinDialogOpen}
          onOpenChange={setJoinDialogOpen}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  )
}
