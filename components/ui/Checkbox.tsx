import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", className)}>
        <label
          htmlFor={id}
          className="flex items-start gap-3 cursor-pointer min-h-[44px]"
        >
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className="mt-1 w-5 h-5 rounded border-secondary/30 text-primary focus:ring-primary/50 cursor-pointer"
            {...props}
          />
          <span className="text-sm text-text leading-relaxed">{label}</span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
