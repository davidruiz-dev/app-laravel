import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  isRequired?: boolean;
  isOptional?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName = "",
      isRequired = false,
      isOptional = false,
      className = "",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    const hasError = Boolean(error);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
            {isOptional && (
              <span className="text-muted ml-1">opcional</span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            className={[
              "block w-full rounded-lg border bg-background/40 px-3 h-10",
              "text-sm text-foreground",
              "placeholder:text-muted/50",
              "outline-none transition-colors",
              "focus:ring-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              hasError
                ? [
                    "border-red-500",
                    "focus:border-red-500",
                    "focus:ring-red-500/20",
                  ].join(" ")
                : [
                    "border-border",
                    "focus:border-primary/50",
                    "focus:ring-primary/30",
                  ].join(" "),
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-red-500"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
