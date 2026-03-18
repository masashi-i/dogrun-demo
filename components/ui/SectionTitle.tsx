import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  sub?: string;
}

export function SectionTitle({ children, className, sub }: SectionTitleProps) {
  return (
    <div className={cn("mb-8 text-center", className)}>
      <h2 className="text-2xl lg:text-3xl font-bold text-text">{children}</h2>
      {sub && <p className="mt-2 text-text-muted">{sub}</p>}
      <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-accent" />
    </div>
  );
}
