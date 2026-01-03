import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function TimetablesLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 mb-3" />
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-32" />
                <div className="flex gap-1 mt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {/* Main content skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            {/* Day tabs skeleton */}
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-8 w-12" />
              ))}
            </div>
            {/* Slots skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-24" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
