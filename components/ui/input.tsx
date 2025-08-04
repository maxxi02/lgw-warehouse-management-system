"use client";
import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, className, type, label, onChange, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="input-container">
        <input
          ref={ref}
          id={inputId}
          onChange={onChange}
          placeholder={placeholder || " "}
          className={`input-field ${className || ""}`}
          type={type}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <span className="input-highlight" />
      </div>
    );
  }
);

Input.displayName = "Input";
