import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function RoomsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user?.role !== "HOD") {
    redirect("/dashboard")
  }

  return <>{children}</>
}

