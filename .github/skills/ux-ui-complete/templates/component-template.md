import React, { ReactNode } from 'react';

// Component Props
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

/**
 * Button Component
 * 
 * A reusable button component with multiple variants and states.
 * 
 * @example
 * <Button variant="primary" size="large">
 *   Click Me
 * </Button>
 * 
 * @example
 * <Button variant="secondary" disabled>
 *   Disabled Button
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  return (\n    <button\n      className={`btn btn--${variant} btn--${size}`}\n      disabled={disabled || loading}\n      onClick={onClick}\n      type={type}\n      aria-label={ariaLabel}\n      aria-busy={loading}\n    >\n      {leftIcon && <span className=\"btn__icon btn__icon--left\">{leftIcon}</span>}\n      {children}\n      {loading && <span className=\"btn__spinner\" aria-hidden=\"true\" />}\n      {rightIcon && <span className=\"btn__icon btn__icon--right\">{rightIcon}</span>}\n    </button>\n  );\n};\n\n// CSS (in button.css or CSS-in-JS)\nconst buttonStyles = `\n  .btn {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    gap: 8px;\n    \n    /* Base styles */\n    font-weight: 500;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n    transition: all 200ms ease;\n    \n    /* Remove default button styling */\n    -webkit-appearance: none;\n    -moz-appearance: none;\n    appearance: none;\n    \n    /* Touch target (accessible) */\n    min-height: 44px;\n    min-width: 44px;\n    \n    /* Focus visible */\n    &:focus-visible {\n      outline: 3px solid #4A90E2;\n      outline-offset: 2px;\n    }\n  }\n  \n  /* SIZES */\n  .btn--small {\n    padding: 8px 12px;\n    font-size: 14px;\n  }\n  \n  .btn--medium {\n    padding: 12px 16px;\n    font-size: 16px; /* Prevent zoom on iOS */\n  }\n  \n  .btn--large {\n    padding: 16px 24px;\n    font-size: 16px;\n  }\n  \n  /* VARIANTS */\n  .btn--primary {\n    background-color: #007AFF;\n    color: white;\n    \n    &:hover:not(:disabled) {\n      background-color: #0051D5;\n    }\n    \n    &:active:not(:disabled) {\n      background-color: #003A99;\n    }\n    \n    &:disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n    }\n  }\n  \n  .btn--secondary {\n    background-color: #F0F0F0;\n    color: #333;\n    border: 1px solid #D0D0D0;\n    \n    &:hover:not(:disabled) {\n      background-color: #E0E0E0;\n    }\n    \n    &:disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n    }\n  }\n  \n  .btn--danger {\n    background-color: #FF3B30;\n    color: white;\n    \n    &:hover:not(:disabled) {\n      background-color: #E62818;\n    }\n    \n    &:disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n    }\n  }\n  \n  .btn--ghost {\n    background-color: transparent;\n    color: #007AFF;\n    border: 2px solid #007AFF;\n    \n    &:hover:not(:disabled) {\n      background-color: rgba(0, 122, 255, 0.1);\n    }\n    \n    &:disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n    }\n  }\n  \n  /* ICONS */\n  .btn__icon {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n  }\n  \n  /* LOADING */\n  .btn__spinner {\n    display: inline-block;\n    width: 16px;\n    height: 16px;\n    border: 2px solid rgba(255, 255, 255, 0.3);\n    border-top-color: white;\n    border-radius: 50%;\n    animation: spin 1s linear infinite;\n  }\n  \n  @keyframes spin {\n    to { transform: rotate(360deg); }\n  }\n`;\n\nexport default Button;\n