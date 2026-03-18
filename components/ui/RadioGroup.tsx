import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  options: RadioOption[];
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ className, label, error, options, name, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <span className="block text-sm font-medium text-text">
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </span>
        )}
        <div className="flex flex-wrap gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <input
                ref={ref}
                type="radio"
                name={name}
                value={opt.value}
                className="w-4 h-4 text-primary focus:ring-primary/50"
                {...props}
              />
              <span className="text-sm text-text">{opt.label}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
