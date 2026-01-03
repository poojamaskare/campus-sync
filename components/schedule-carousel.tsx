"use client"

import * as React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatTime } from "@/lib/utils"
import { Calendar, Clock, MapPin, User, BookOpen, Coffee, Layers, ChevronLeft, ChevronRight } from "lucide-react"
import type { WeeklySchedule, ScheduleSlot } from "@/app/actions/schedule"
import { DayOfWeek } from "@prisma/client"

interface ScheduleCarouselProps {
  weeklySchedule: WeeklySchedule
  todayDate: string
}

const DAY_NAMES: Record<DayOfWeek, string> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday"
}

const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun"
}

function getDayOfWeek(date: Date): DayOfWeek {
  const dayIndex = date.getDay()
  const mapping: DayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
  return mapping[dayIndex]
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

// Generate array of dates centered around today
function generateDates(centerDate: Date, daysBefore: number, daysAfter: number): Date[] {
  const dates: Date[] = []
  for (let i = -daysBefore; i <= daysAfter; i++) {
    dates.push(addDays(centerDate, i))
  }
  return dates
}

export function ScheduleCarousel({ weeklySchedule, todayDate }: ScheduleCarouselProps) {
  const today = React.useMemo(() => new Date(todayDate), [todayDate])
  
  // Track the selected date
  const [selectedDate, setSelectedDate] = React.useState<Date>(today)
  
  // Track the visible range center (for infinite scroll)
  const [rangeCenter, setRangeCenter] = React.useState<Date>(today)
  
  // Number of days to show before and after the center
  const DAYS_BEFORE = 14
  const DAYS_AFTER = 14
  
  // Generate visible dates
  const visibleDates = React.useMemo(() => 
    generateDates(rangeCenter, DAYS_BEFORE, DAYS_AFTER),
    [rangeCenter]
  )
  
  // Find the index of selected date in visible dates
  const selectedIndex = React.useMemo(() => {
    return visibleDates.findIndex(d => isSameDay(d, selectedDate))
  }, [visibleDates, selectedDate])
  
  // Find today's index in visible dates
  const todayIndex = React.useMemo(() => {
    return visibleDates.findIndex(d => isSameDay(d, today))
  }, [visibleDates, today])

  // Get schedule for selected date
  const selectedDayOfWeek = getDayOfWeek(selectedDate)
  const currentSlots = weeklySchedule[selectedDayOfWeek] || []
  const isToday = isSameDay(selectedDate, today)

  // Handle navigation
  const handlePrevious = () => {
    const newCenter = addDays(rangeCenter, -7)
    setRangeCenter(newCenter)
  }

  const handleNext = () => {
    const newCenter = addDays(rangeCenter, 7)
    setRangeCenter(newCenter)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    
    // If selecting near edges, shift the range
    const dateIndex = visibleDates.findIndex(d => isSameDay(d, date))
    if (dateIndex <= 3) {
      setRangeCenter(addDays(rangeCenter, -7))
    } else if (dateIndex >= visibleDates.length - 4) {
      setRangeCenter(addDays(rangeCenter, 7))
    }
  }

  const handleGoToToday = () => {
    setSelectedDate(today)
    setRangeCenter(today)
  }

  // Scroll container ref for centering selected date
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (scrollContainerRef.current && selectedIndex >= 0) {
      const container = scrollContainerRef.current
      const items = container.querySelectorAll('[data-date-item]')
      const selectedItem = items[selectedIndex] as HTMLElement
      if (selectedItem) {
        const containerWidth = container.offsetWidth
        const itemLeft = selectedItem.offsetLeft
        const itemWidth = selectedItem.offsetWidth
        const scrollTo = itemLeft - (containerWidth / 2) + (itemWidth / 2)
        container.scrollTo({ left: scrollTo, behavior: 'smooth' })
      }
    }
  }, [selectedIndex, visibleDates])

  return (
    <div className="space-y-4">
      {/* Day Selector */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-2 px-1 py-1">
              {visibleDates.map((date, index) => {
                const dayOfWeek = getDayOfWeek(date)
                const isSelected = isSameDay(date, selectedDate)
                const isCurrentDay = isSameDay(date, today)
                
                return (
                  <button
                    key={date.toISOString()}
                    data-date-item
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={cn(
                      "flex-shrink-0 w-16 rounded-lg border p-2 text-center transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted",
                      isCurrentDay && !isSelected && "ring-2 ring-primary/30"
                    )}
                  >
                    <div className="text-xs font-medium opacity-80">
                      {isCurrentDay ? "Today" : DAY_SHORT[dayOfWeek]}
                    </div>
                    <div className="text-lg font-bold">
                      {date.getDate()}
                    </div>
                    <div className="text-xs opacity-70">
                      {DAY_SHORT[dayOfWeek]}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Go to Today button */}
        {!isToday && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToToday}
              className="text-xs"
            >
              Go to Today
            </Button>
          </div>
        )}
      </div>

      {/* Current Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            {DAY_NAMES[selectedDayOfWeek]}
            {isToday && (
              <Badge variant="secondary" className="ml-2">
                Today
              </Badge>
            )}
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDateDisplay(selectedDate)}
        </span>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-3">
        {currentSlots.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Coffee className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No classes scheduled</p>
              <p className="text-sm text-muted-foreground/70">Enjoy your day off!</p>
            </CardContent>
          </Card>
        ) : (
          currentSlots.map((slot) => (
            <Card 
              key={slot.id} 
              className={cn(
                "transition-all",
                slot.isBreak && "bg-muted/50 border-dashed"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={slot.isBreak ? "outline" : "default"}
                      className="shrink-0"
                    >
                      {slot.slotTypeName}
                    </Badge>
                    {slot.batchName && (
                      <Badge variant="secondary" className="shrink-0">
                        <Layers className="h-3 w-3 mr-1" />
                        {slot.batchName}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {slot.isBreak ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Coffee className="h-4 w-4" />
                    <span className="text-sm">Break Time</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {slot.subjectName && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{slot.subjectName}</span>
                        {slot.subjectShortName && (
                          <span className="text-sm text-muted-foreground">
                            ({slot.subjectShortName})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {slot.roomNumber && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>Room {slot.roomNumber}</span>
                        </div>
                      )}
                      {slot.facultyName && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{slot.facultyName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
