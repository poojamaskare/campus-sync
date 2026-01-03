import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Clock,
  BookOpen,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeaturesSectionWithHoverEffectsProps {
  features?: Feature[];
  className?: string;
}

export function FeaturesSectionWithHoverEffects({
  features,
  className,
}: FeaturesSectionWithHoverEffectsProps) {
  const defaultFeatures: Feature[] = [
    {
      title: "Smart Timetables",
      description:
        "Create and manage timetables with an intuitive interface. Assign subjects, rooms, and faculty with ease.",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      title: "Group Management",
      description:
        "Organize students and faculty into groups. Share timetables instantly with join codes.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Availability Tracking",
      description:
        "See who's free and when. Check faculty and room availability at a glance.",
      icon: <Clock className="h-6 w-6" />,
    },
    {
      title: "Subject & Room Config",
      description:
        "Manage subjects, rooms, batches, and slot types all from one central dashboard.",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "Personal Dashboard",
      description:
        "Your daily schedule at a glance. Navigate through days and weeks effortlessly.",
      icon: <LayoutDashboard className="h-6 w-6" />,
    },
    {
      title: "Custom Preferences",
      description:
        "Filter your schedule by slot types and batches. See only what matters to you.",
      icon: <CheckCircle2 className="h-6 w-6" />,
    },
  ];

  const featuresToRender = features || defaultFeatures;

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-10 max-w-7xl mx-auto",
        className
      )}
    >
      {featuresToRender.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  // Adjust border logic for 3-column grid (6 items = 2 rows of 3)
  const isFirstRow = index < 3;
  const isFirstColumn = index % 3 === 0;
  const isLastColumn = index % 3 === 2;

  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        isFirstColumn && "lg:border-l dark:border-neutral-800",
        isFirstRow && "lg:border-b dark:border-neutral-800"
      )}
    >
      {isFirstRow && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {!isFirstRow && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}

      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>

      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

