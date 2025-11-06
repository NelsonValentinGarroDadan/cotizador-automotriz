/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputClassName?: string;
  labelClassName?: string;
  onFileChange?: (file: File | null) => void;
  /** URL o base64 de la imagen actual, si existe */
  defaultImage?: string;
}

export function CustomInput({
  label,
  type = 'text',
  error,
  inputClassName = '',
  labelClassName = '',
  onFileChange,
  defaultImage,
  ...props
}: CustomInputProps) {
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
    <div className="flex flex-col gap-2">
      {label && (
        <label className={`text-sm font-medium ${labelClassName}`}>
          {label}
        </label>
      )}

      {type === 'file' ? (
        <div className="flex flex-col gap-3">
          {preview && (
            <div className="flex flex-col gap-1 items-start">
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
      ) : (
        <input
          type={type}
          className={`rounded border px-3 py-2 text-sm ${inputClassName}`}
          {...props}
        />
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
