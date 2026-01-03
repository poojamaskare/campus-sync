import { auth } from "@/auth"
import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // Fetch additional user data (name, availability, status) from database
  let userData = null
  if (session?.user?.email) {
    userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        availability: true,
        status: true,
      }
    })
  }

  return (
    <DashboardLayoutClient 
      session={session}
      userName={userData?.name || session?.user?.name || null}
      userAvailability={userData?.availability || "Active"}
      userStatus={userData?.status || null}
    >
      {children}
    </DashboardLayoutClient>
  )
}

