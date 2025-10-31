'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      error,
      type = 'text',
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className={`flex flex-col ${containerClassName}`}>
        {label && (
          <label className={`text-gray mb-1 ${labelClassName}`}>
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full border-2 focus:outline-none focus:border-2 border-blue-light rounded-md py-3 px-2 ${
              error ? 'border-red-500' : ''
            } ${isPassword ? 'pr-10' : ''} ${inputClassName}`}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div> 
          <span className="text-red-500 text-sm mt-1 h-6">{error && error}</span> 
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

