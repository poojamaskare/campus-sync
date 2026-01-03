"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createBatch(prevState: any, formData: FormData) {
  const name = formData.get("name") as string

  // Validation
  if (!name) {
    return { error: "Batch name is required" }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { error: "Batch name cannot be empty" }
  }

  if (trimmedName.length > 100) {
    return { error: "Batch name must be 100 characters or less" }
  }

  try {
    await prisma.batch.create({
      data: { name: trimmedName },
    })
    revalidatePath("/dashboard/batches")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Batch name already exists" }
    }
    if (error.code === "P2003") {
      return { error: "Invalid data provided" }
    }
    console.error("Create batch error:", error)
    return { error: "Failed to create batch. Please try again." }
  }
}

export async function updateBatch(prevState: any, formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string

  // Validation
  if (!id || !name) {
    return { error: "Batch name is required" }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { error: "Batch name cannot be empty" }
  }

  if (trimmedName.length > 100) {
    return { error: "Batch name must be 100 characters or less" }
  }

  try {
    await prisma.batch.update({
      where: { id },
      data: { name: trimmedName },
    })
    revalidatePath("/dashboard/batches")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Batch name already exists" }
    }
    if (error.code === "P2025") {
      return { error: "Batch not found" }
    }
    console.error("Update batch error:", error)
    return { error: "Failed to update batch. Please try again." }
  }
}

export async function deleteBatch(id: string) {
  try {
    await prisma.batch.delete({
      where: { id },
    })
    revalidatePath("/dashboard/batches")
    return { success: true }
  } catch (error) {
    console.error("Delete batch error:", error)
    return { error: "Failed to delete batch" }
  }
}

export async function getBatches() {
  try {
    return await prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Get batches error:", error)
    return []
  }
}
