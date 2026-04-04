"use client";

import React, { useId, useState } from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import type { AuthFormData } from "../types/auth";

interface AuthInputProps<T extends FieldValues = AuthFormData> {
  type: string;
  name: Path<T>;
  placeholder: string;
  icon: LucideIcon;
  register: UseFormRegister<T>;
  error?: string;
  /** Optional visible or screen-reader label. If provided, a label is rendered (use className "sr-only" for screen-reader only). */
  label?: string;
  /** Optional id for the input; used for label htmlFor and aria-describedby. Defaults to a generated id. */
  id?: string;
}

export function AuthInput<T extends FieldValues = AuthFormData>({
  type,
  name,
  placeholder,
  icon: Icon,
  register,
  error,
  label,
  id: idProp,
}: AuthInputProps<T>) {
  const generatedId = useId();
  const id = idProp ?? `${generatedId}-${String(name)}`;
  const errorId = `${id}-error`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const toggleLabel = showPassword ? "Hide password" : "Show password";

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden />
        </div>
        <input
          id={id}
          type={inputType}
          {...register(name)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`block w-full pl-10 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent ${
            isPassword ? "pr-11" : "pr-3"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-blue)] focus-visible:ring-offset-1 rounded-r-lg"
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            {showPassword ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-red-500 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
