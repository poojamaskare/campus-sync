import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function TimetablesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // All authenticated users can access timetables
  // (HOD sees all, others see only assigned ones)
  return <>{children}</>
}
