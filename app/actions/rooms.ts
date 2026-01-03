"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createRoom(prevState: any, formData: FormData) {
  const number = formData.get("number") as string

  // Validation
  if (!number) {
    return { error: "Room number is required" }
  }

  const trimmedNumber = number.trim()
  if (!trimmedNumber) {
    return { error: "Room number cannot be empty" }
  }

  if (trimmedNumber.length > 50) {
    return { error: "Room number must be 50 characters or less" }
  }

  try {
    await prisma.room.create({
      data: { number: trimmedNumber },
    })
    revalidatePath("/dashboard/rooms")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Room number already exists" }
    }
    if (error.code === "P2003") {
      return { error: "Invalid data provided" }
    }
    console.error("Create room error:", error)
    return { error: "Failed to create room. Please try again." }
  }
}

export async function updateRoom(prevState: any, formData: FormData) {
  const id = formData.get("id") as string
  const number = formData.get("number") as string

  // Validation
  if (!id || !number) {
    return { error: "Room number is required" }
  }

  const trimmedNumber = number.trim()
  if (!trimmedNumber) {
    return { error: "Room number cannot be empty" }
  }

  if (trimmedNumber.length > 50) {
    return { error: "Room number must be 50 characters or less" }
  }

  try {
    await prisma.room.update({
      where: { id },
      data: { number: trimmedNumber },
    })
    revalidatePath("/dashboard/rooms")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Room number already exists" }
    }
    if (error.code === "P2025") {
      return { error: "Room not found" }
    }
    console.error("Update room error:", error)
    return { error: "Failed to update room. Please try again." }
  }
}

export async function deleteRoom(id: string) {
  try {
    await prisma.room.delete({
      where: { id },
    })
    revalidatePath("/dashboard/rooms")
    return { success: true }
  } catch (error) {
    console.error("Delete room error:", error)
    return { error: "Failed to delete room" }
  }
}

export async function getRooms() {
  try {
    return await prisma.room.findMany({
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Get rooms error:", error)
    return []
  }
}

