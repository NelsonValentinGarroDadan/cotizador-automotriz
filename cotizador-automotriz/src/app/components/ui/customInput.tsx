
'use client';

import { forwardRef, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;

onFileChange?: (file: File | null) => void;
  /** URL o base64 de la imagen actual, si existe */
  defaultImage?: string;


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
      defaultImage,
      onFileChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type; 
    const [preview, setPreview] = useState<string | null>(defaultImage || null);
    const [originalImage, setOriginalImage] = useState<string | null>(defaultImage || null);
    const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(defaultImage || null);
    setOriginalImage(defaultImage || null);
  }, [defaultImage]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setHasChanged(true);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onFileChange?.(file);
    } else {
      // Si quita el archivo, volver al original
      setPreview(originalImage);
      setHasChanged(false);
      onFileChange?.(null);
    }
  };

  const handleRemoveImage = () => {
    // Quitar vista previa y volver al original
    setPreview(originalImage);
    setHasChanged(false);
    onFileChange?.(null);
  };
    return (
      <div className={`flex flex-col ${containerClassName}`}>
        {label && (
          <label className={`text-gray mb-1 ${labelClassName}`}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {type === 'file' ? (
        <div className="flex flex-col gap-3">
          {preview && (
            <div className="flex flex-col gap-1 items-start">
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <img
                src={preview}
                alt="Vista previa"
                className="w-auto max-h-40 mx-auto object-contain  rounded shadow-sm bg-white"
              />
              {hasChanged && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-600 underline hover:text-red-800 transition"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`rounded border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-dark cursor-pointer ${inputClassName}`}
            {...props}
          />
        </div>
        ):(
             <input
              ref={ref}
              type={inputType}
              className={`w-full border-2 focus:outline-none focus:border-2 border-blue-light rounded-md py-3 px-2 ${
                error ? 'border-red-500' : ''
              } ${isPassword ? 'pr-10' : ''} ${inputClassName}`}
              {...props}
            />
        )}
          
          
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