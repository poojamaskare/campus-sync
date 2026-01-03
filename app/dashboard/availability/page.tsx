import { getFacultyAvailability, getRoomAvailability } from "@/app/actions/availability"
import { AvailabilityClient } from "@/components/availability-client"

export default async function AvailabilityPage() {
  const [facultyData, roomData] = await Promise.all([
    getFacultyAvailability(),
    getRoomAvailability()
  ])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Availability</h1>
        <p className="text-muted-foreground text-sm">
          View availability of faculty and rooms based on timetables
        </p>
      </div>

      <AvailabilityClient 
        facultyData={facultyData}
        roomData={roomData}
      />
    </div>
  )
}
