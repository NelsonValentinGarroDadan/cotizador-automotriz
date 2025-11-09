import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MultiSelectFilterProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectFilter({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Seleccionar...' 
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedLabels = value
    .map(v => options.find(opt => opt.value === v)?.label)
    .filter(Boolean);

  return (
    <div ref={dropdownRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray/50 px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60 cursor-pointer bg-white min-h-[42px] flex items-center justify-between"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-gray/60">{placeholder}</span>
          ) : (
            selectedLabels.map((label, idx) => (
              <span
                key={value[idx]}
                className="bg-blue/10 text-blue px-2 py-1 rounded text-sm flex items-center gap-1"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => removeOption(value[idx], e)}
                  className="hover:text-blue-dark"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray/50 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray">
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-3 py-2 hover:bg-gray/10 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="mr-2 w-4 h-4 text-blue border-gray/50 rounded focus:ring-2 focus:ring-blue/60"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}