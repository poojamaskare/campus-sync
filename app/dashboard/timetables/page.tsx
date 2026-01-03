import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TimetablesClient } from "./timetables-client"
import {
  getTimetables,
  getAllSubjects,
  getAllSlotTypes,
  getAllRooms,
  getAllFaculty,
  getAllGroups,
  getAllBatches,
} from "@/app/actions/timetables"

export default async function TimetablesPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true }
  })

  if (!user) {
    redirect("/login")
  }

  const isHOD = user.role === "HOD"

  // Fetch all data
  const [timetables, subjects, slotTypes, rooms, faculty, groups, batches] = await Promise.all([
    getTimetables(),
    getAllSubjects(),
    getAllSlotTypes(),
    getAllRooms(),
    getAllFaculty(),
    isHOD ? getAllGroups() : Promise.resolve([]),
    getAllBatches(),
  ])

  return (
    <TimetablesClient
      timetables={timetables}
      subjects={subjects}
      slotTypes={slotTypes}
      rooms={rooms}
      faculty={faculty}
      groups={groups}
      batches={batches}
      isHOD={isHOD}
      userId={user.id}
    />
  )
}
