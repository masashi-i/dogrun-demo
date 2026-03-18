import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-secondary/10 p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
