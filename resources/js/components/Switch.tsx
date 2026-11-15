import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 items-center
          rounded-full transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:ring-offset-2
          ${checked ? "bg-blue-600" : "bg-gray-300"}
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full
            bg-white shadow transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0.5"}
          `}
        />
      </button>

      {label && (
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
    </label>
  );
};
