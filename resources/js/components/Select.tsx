import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      containerClassName = "",
      className = "",
      id,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;

    const hasError = Boolean(error);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            className={[
              "block w-full appearance-none rounded-lg border",
              "bg-surface px-3 py-2.5 pr-10",
              "text-sm text-foreground",
              "outline-none transition-colors",
              "cursor-pointer",
              "focus:ring-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon ? "pl-10" : "",
              hasError
                ? [
                    "border-red-500",
                    "focus:border-red-500",
                    "focus:ring-red-500/20",
                  ].join(" ")
                : [
                    "border-border",
                    "focus:border-primary",
                    "focus:ring-primary/20",
                  ].join(" "),
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          >
            {children}
          </select>

          {/* Chevron */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 7.72a.75.75 0 0 1 1.06 0L10 11.44l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.78a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {error ? (
          <p
            id={`${selectId}-error`}
            className="mt-1.5 text-sm text-red-500"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${selectId}-hint`}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
