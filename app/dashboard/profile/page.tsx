import { Suspense } from "react"
import { redirect } from "next/navigation"
import { ProfileSkeleton } from "@/components/profile-skeleton"
import { ProfileClient } from "@/components/profile-client"
import { getCurrentUser } from "@/app/actions/auth"
import { getStudentPreferences } from "@/app/actions/preferences"

async function ProfileContent() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get preferences for students
  const preferences = user.role === "Student" 
    ? await getStudentPreferences()
    : null

  return (
    <ProfileClient
      user={{
        name: user.name || null,
        email: user.email || "",
        role: user.role || "Student",
        availability: user.availability || "Active",
        status: user.status || null,
      }}
      preferences={preferences}
    />
  )
}

export default async function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  )
}

