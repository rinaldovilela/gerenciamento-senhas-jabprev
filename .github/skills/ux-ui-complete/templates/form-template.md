import React, { useState } from 'react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea' | 'select';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
}

/**
 * FormField Component
 * 
 * Reusable form field with label, validation, and error messages
 * 
 * @example
 * <FormField
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   error={emailError}
 *   hint="We'll never share your email"
 *   required
 * />
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',\n  value,\n  onChange,\n  error,\n  hint,\n  required = false,\n  placeholder,\n  options = [],\n  disabled = false,\n}) => {\n  const fieldId = `field-${label.toLowerCase().replace(/\\s+/g, '-')}`;\n  const errorId = `${fieldId}-error`;\n  const hintId = `${fieldId}-hint`;\n  \n  const describedBy = [\n    error ? errorId : null,\n    hint ? hintId : null,\n  ].filter(Boolean).join(' ');\n  \n  return (\n    <div className=\"form-field\">\n      <label htmlFor={fieldId} className=\"form-field__label\">\n        {label}\n        {required && <span className=\"form-field__required\" aria-label=\"required\">*</span>}\n      </label>\n      \n      {hint && (\n        <p id={hintId} className=\"form-field__hint\">\n          {hint}\n        </p>\n      )}\n      \n      {type === 'textarea' ? (\n        <textarea\n          id={fieldId}\n          className={`form-field__input form-field__input--textarea ${\n            error ? 'form-field__input--error' : ''\n          }`}\n          value={value}\n          onChange={(e) => onChange(e.target.value)}\n          placeholder={placeholder}\n          disabled={disabled}\n          required={required}\n          aria-invalid={!!error}\n          aria-describedby={describedBy || undefined}\n        />\n      ) : type === 'select' ? (\n        <select\n          id={fieldId}\n          className={`form-field__input form-field__select ${\n            error ? 'form-field__input--error' : ''\n          }`}\n          value={value}\n          onChange={(e) => onChange(e.target.value)}\n          disabled={disabled}\n          required={required}\n          aria-invalid={!!error}\n          aria-describedby={describedBy || undefined}\n        >\n          <option value=\"\">Choose...</option>\n          {options.map((opt) => (\n            <option key={opt.value} value={opt.value}>\n              {opt.label}\n            </option>\n          ))}\n        </select>\n      ) : (\n        <input\n          id={fieldId}\n          type={type}\n          className={`form-field__input ${\n            error ? 'form-field__input--error' : ''\n          }`}\n          value={value}\n          onChange={(e) => onChange(e.target.value)}\n          placeholder={placeholder}\n          disabled={disabled}\n          required={required}\n          aria-invalid={!!error}\n          aria-describedby={describedBy || undefined}\n        />\n      )}\n      \n      {error && (\n        <p id={errorId} className=\"form-field__error\" role=\"alert\">\n          {error}\n        </p>\n      )}\n    </div>\n  );\n};\n\n// CSS\nconst formFieldStyles = `\n  .form-field {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    margin-bottom: 16px;\n  }\n  \n  .form-field__label {\n    font-weight: 500;\n    font-size: 16px;\n    color: #333;\n  }\n  \n  .form-field__required {\n    color: #FF3B30;\n    margin-left: 4px;\n  }\n  \n  .form-field__hint {\n    font-size: 14px;\n    color: #666;\n    margin: 0;\n  }\n  \n  .form-field__input,\n  .form-field__select {\n    padding: 12px;\n    font-size: 16px; /* Prevents zoom on iOS */\n    border: 2px solid #D0D0D0;\n    border-radius: 4px;\n    font-family: inherit;\n    transition: border-color 200ms ease, box-shadow 200ms ease;\n    \n    /* Remove default browser styling */\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    appearance: none;\n    \n    /* Touch target */\n    min-height: 44px;\n  }\n  \n  .form-field__select {\n    background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%23333' d='M0 0l6 8 6-8'/%3E%3C/svg%3E\");\n    background-repeat: no-repeat;\n    background-position: right 12px center;\n    background-size: 12px;\n    padding-right: 36px;\n  }\n  \n  .form-field__input:focus,\n  .form-field__select:focus {\n    outline: none;\n    border-color: #007AFF;\n    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);\n  }\n  \n  .form-field__input:disabled,\n  .form-field__select:disabled {\n    background-color: #F5F5F5;\n    color: #999;\n    cursor: not-allowed;\n  }\n  \n  .form-field__input--error,\n  .form-field__select.form-field__input--error {\n    border-color: #FF3B30;\n  }\n  \n  .form-field__input--error:focus,\n  .form-field__select.form-field__input--error:focus {\n    box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);\n  }\n  \n  .form-field__error {\n    color: #FF3B30;\n    font-size: 14px;\n    margin: 0;\n  }\n  \n  .form-field__input--textarea {\n    resize: vertical;\n    min-height: 120px;\n    font-family: 'Monaco', 'Menlo', monospace;\n  }\n`;\n\nexport default FormField;\n