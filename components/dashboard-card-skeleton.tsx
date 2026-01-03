import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-5 w-24" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-32 mt-2" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-20" />
      </CardContent>
    </Card>
  )
}

