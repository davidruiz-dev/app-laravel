import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  isOptional?: boolean;
};

export function Textarea({
  label,
  error,
  hint,
  isRequired = false,
  isOptional = false,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id ?? React.useId();

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
            {isOptional && (
              <span className="text-muted ml-1">(opcional)</span>
            )}
        </label>
      )}

      <textarea
        id={textareaId}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        className={[
          "w-full resize-y rounded-lg px-3 py-2 bg-background/40 border",
          "text-sm outline-none transition",
          "placeholder:text-gray-400",
          "focus:ring-2",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
            : "border-border focus:border-primary focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60",
          className,
        ].join(" ")}
        {...props}
      />

      {error && (
        <p id={`${textareaId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${textareaId}-hint`} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
