'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface SelectSearchOption {
  value: string;
  label: string;
}

interface SelectSearchProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  loadOptions: (search: string) => Promise<SelectSearchOption[]>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SelectSearch({
  value,
  onChange,
  loadOptions,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
}: SelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<SelectSearchOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const result = await loadOptions(search);
        if (active) {
          setOptions(result);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOptions();
    return () => {
      active = false;
    };
  }, [isOpen, search, loadOptions]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(undefined);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`border border-gray/50 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60 min-h-[42px] flex items-center justify-between ${
          disabled
            ? 'bg-gray/10 cursor-not-allowed'
            : 'bg-yellow-light cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedOption ? (
            <>
              <span className="text-sm text-black">{selectedOption.label}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray hover:text-blue-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <span className="text-gray/60 text-sm">{placeholder}</span>
          )}
        </div>
        {!disabled && (
          <ChevronDown
            className={`w-4 h-4 text-gray transition-transform shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray/50 rounded shadow-lg max-h-60 overflow-y-auto">
          <div className="px-3 py-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray/50 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue/60"
              placeholder="Buscar..."
            />
          </div>
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray">Cargando...</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full text-left px-3 py-2 hover:bg-gray/10 text-sm"
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

