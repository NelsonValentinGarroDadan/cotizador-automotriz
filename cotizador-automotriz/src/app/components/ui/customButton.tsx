import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export default function CustomButton({
  className = '',
  children,
  ...props
}: CustomButtonProps) {
  return (
    <button
      {...props}
      className={`hover:bg-blue bg-blue/90 text-white px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue/90 ${className}`}
    >
      {children}
    </button>
  );
}
