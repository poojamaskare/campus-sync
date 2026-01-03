"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createSubject(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const shortName = formData.get("shortName") as string

  // Validation
  if (!name || !shortName) {
    return { error: "Name and short name are required" }
  }

  const trimmedName = name.trim()
  const trimmedShortName = shortName.trim().toUpperCase()

  if (!trimmedName || !trimmedShortName) {
    return { error: "Name and short name cannot be empty" }
  }

  if (trimmedName.length > 100) {
    return { error: "Subject name must be 100 characters or less" }
  }

  if (trimmedShortName.length > 20) {
    return { error: "Short name must be 20 characters or less" }
  }

  if (!/^[A-Z0-9\s.\-]+$/.test(trimmedShortName)) {
    return { error: "Short name can only contain letters, numbers, spaces, hyphens, and periods" }
  }

  try {
    await prisma.subject.create({
      data: { name: trimmedName, shortName: trimmedShortName },
    })
    revalidatePath("/dashboard/subjects")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0]
      if (field === "name") {
        return { error: "Subject name already exists" }
      }
      if (field === "shortName") {
        return { error: "Short name already exists" }
      }
      return { error: "Subject with this information already exists" }
    }
    console.error("Create subject error:", error)
    return { error: "Failed to create subject. Please try again." }
  }
}

export async function updateSubject(prevState: any, formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const shortName = formData.get("shortName") as string

  // Validation
  if (!id || !name || !shortName) {
    return { error: "All fields are required" }
  }

  const trimmedName = name.trim()
  const trimmedShortName = shortName.trim().toUpperCase()

  if (!trimmedName || !trimmedShortName) {
    return { error: "Name and short name cannot be empty" }
  }

  if (trimmedName.length > 100) {
    return { error: "Subject name must be 100 characters or less" }
  }

  if (trimmedShortName.length > 20) {
    return { error: "Short name must be 20 characters or less" }
  }

  if (!/^[A-Z0-9\s.\-]+$/.test(trimmedShortName)) {
    return { error: "Short name can only contain letters, numbers, spaces, hyphens, and periods" }
  }

  try {
    await prisma.subject.update({
      where: { id },
      data: { name: trimmedName, shortName: trimmedShortName },
    })
    revalidatePath("/dashboard/subjects")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0]
      if (field === "name") {
        return { error: "Subject name already exists" }
      }
      if (field === "shortName") {
        return { error: "Short name already exists" }
      }
      return { error: "Subject with this information already exists" }
    }
    if (error.code === "P2025") {
      return { error: "Subject not found" }
    }
    console.error("Update subject error:", error)
    return { error: "Failed to update subject. Please try again." }
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({
      where: { id },
    })
    revalidatePath("/dashboard/subjects")
    return { success: true }
  } catch (error) {
    console.error("Delete subject error:", error)
    return { error: "Failed to delete subject" }
  }
}

export async function getSubjects() {
  try {
    return await prisma.subject.findMany({
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Get subjects error:", error)
    return []
  }
}

