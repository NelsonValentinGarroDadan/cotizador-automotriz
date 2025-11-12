/* eslint-disable @typescript-eslint/no-explicit-any */
// app/planes/components/CoefficientsManager.tsx
'use client';
import { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { CreatePlanInput, CoefficientInput } from '@/app/types/plan';
import CustomButton from '@/app/components/ui/customButton';
import { Plus, Trash2 } from 'lucide-react'; 

interface CoefficientsManagerProps {
  setValue: UseFormSetValue<CreatePlanInput>;
  watch: UseFormWatch<CreatePlanInput>;
  disabled?: boolean;
}

// Meses predefinidos comunes
const PRESET_MONTHS = [6, 12, 18, 24, 36, 48, 60, 72, 84];

export default function CoefficientsManager({ 
  setValue, 
  watch,
  disabled = false 
}: CoefficientsManagerProps) {
  const coefficients = watch('coefficients') || [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const addCoefficient = () => {
    // ✅ Determinar el siguiente plazo basado en los existentes
    const existingPlazos = coefficients.map(c => c.plazo);
    let nextPlazo = 6; // Empezar con 6
    
    // Buscar el siguiente plazo disponible en la secuencia de PRESET_MONTHS
    for (const presetMonth of PRESET_MONTHS) {
      if (!existingPlazos.includes(presetMonth)) {
        nextPlazo = presetMonth;
        break;
      }
    }
    
    // Si ya existen todos los preset months, agregar el siguiente múltiplo
    if (existingPlazos.includes(nextPlazo) && coefficients.length > 0) {
      const maxPlazo = Math.max(...existingPlazos);
      nextPlazo = maxPlazo + 6;
    }

    // ✅ Copiar valores del último coeficiente si existe
    const lastCoefficient = coefficients[coefficients.length - 1];
    
    const newCoefficient: CoefficientInput = {
      plazo: nextPlazo,
      tna: lastCoefficient?.tna || 0,
      coeficiente: lastCoefficient?.coeficiente || 0,
      quebrantoFinanciero: undefined, // ✅ undefined en lugar de 0
      cuotaBalon: undefined,
      cuotaPromedio: undefined,
      cuotaBalonMonths: [],
    };
    
    setValue('coefficients', [...coefficients, newCoefficient]);
    setExpandedIndex(coefficients.length);
  };

  const removeCoefficient = (index: number) => {
    const newCoefficients = coefficients.filter((_, i) => i !== index);
    setValue('coefficients', newCoefficients);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateCoefficient = (index: number, field: keyof CoefficientInput, value: any) => {
    const newCoefficients = [...coefficients];
    newCoefficients[index] = { ...newCoefficients[index], [field]: value };
    
    // ✅ Si se ingresa cuotaBalon y no hay meses seleccionados, marcar el plazo completo
    if (field === 'cuotaBalon' && value) {
      const currentMonths = newCoefficients[index].cuotaBalonMonths || [];
      if (currentMonths.length === 0) {
        const plazo = newCoefficients[index].plazo;
        // Marcar el plazo completo como primer mes de cuota balón
        newCoefficients[index].cuotaBalonMonths = [plazo];
      }
    }
    
    setValue('coefficients', newCoefficients);
  };

  const togglePresetMonth = (index: number, month: number) => {
    const coefficient = coefficients[index];
    const currentMonths = coefficient.cuotaBalonMonths || [];
    
    if (month > coefficient.plazo) {
      return; // No permitir meses mayores al plazo
    }
    
    if (currentMonths.includes(month)) {
      // Remover mes
      updateCoefficient(index, 'cuotaBalonMonths', currentMonths.filter(m => m !== month));
    } else {
      // Agregar mes
      updateCoefficient(index, 'cuotaBalonMonths', [...currentMonths, month].sort((a, b) => a - b));
    }
  };

  const removeCuotaBalonMonth = (index: number, month: number) => {
    const coefficient = coefficients[index];
    const currentMonths = coefficient.cuotaBalonMonths || [];
    updateCoefficient(index, 'cuotaBalonMonths', currentMonths.filter(m => m !== month));
  };

  if (disabled && coefficients.length === 0) {
    return (
      <div className="border border-gray/50 px-3 py-2 rounded bg-gray/5">
        <p className="text-sm text-gray">Sin coeficientes definidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-black">
          Coeficientes {!disabled && <span className="text-red-500">*</span>}
        </label>
        {!disabled && (
          <CustomButton
            type="button"
            onClick={addCoefficient}
            className="py-1! px-3! text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Coeficiente
          </CustomButton>
        )}
      </div>

      {coefficients.length === 0 && !disabled && (
        <div className="border border-dashed border-gray/50 px-4 py-8 rounded text-center">
          <p className="text-sm text-gray mb-2">No hay coeficientes definidos</p>
          <p className="text-xs text-gray/70">Haz clic en &quot;Agregar Coeficiente&quot; para comenzar</p>
        </div>
      )}

      <div className="space-y-2">
        {coefficients.map((coeff, index) => (
          <div key={index} className="border border-gray/30 rounded overflow-hidden">
            {/* Header del coeficiente */}
            <div
              className="flex items-center justify-between p-3 bg-gray/5 cursor-pointer hover:bg-gray/10"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">Plazo {coeff.plazo} meses</span>
                <span className="text-xs text-gray">
                  TNA: {coeff.tna}% | Coef: {coeff.coeficiente}
                </span>
                {coeff.cuotaBalon && (
                  <span className="text-xs bg-blue/10 text-blue px-2 py-0.5 rounded">
                    Balón: ${coeff.cuotaBalon}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCoefficient(index);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <span className="text-sm">
                  {expandedIndex === index ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Detalles expandibles */}
            {expandedIndex === index && (
              <div className="p-4 space-y-4 bg-white">
                {/* Campos principales en una sola fila */}
                <div className="grid grid-cols-6 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Plazo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={coeff.plazo}
                      onChange={(e) => updateCoefficient(index, 'plazo', parseInt(e.target.value) || 0)}
                      className="border border-yellow-light bg-yellow-light px-2 py-2 rounded w-full text-sm"
                      disabled={disabled}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      TNA (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={coeff.tna}
                      onChange={(e) => updateCoefficient(index, 'tna', parseFloat(e.target.value) || 0)}
                      className="border border-yellow-light bg-yellow-light px-2 py-2 rounded w-full text-sm"
                      disabled={disabled}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Coeficiente <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={coeff.coeficiente}
                      onChange={(e) => updateCoefficient(index, 'coeficiente', parseFloat(e.target.value) || 0)}
                      className="border border-yellow-light bg-yellow-light px-2 py-2 rounded w-full text-sm"
                      disabled={disabled}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Quebranto
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={coeff.quebrantoFinanciero || ''} 
                      onChange={(e) => updateCoefficient(index, 'quebrantoFinanciero', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="border border-yellow-light bg-yellow-light px-2 py-2 rounded w-full text-sm"
                      disabled={disabled}
                      placeholder="Opcional"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Cuota Balón
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={coeff.cuotaBalon || ''}
                      onChange={(e) => updateCoefficient(index, 'cuotaBalon', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="border border-yellow-light bg-yellow-light px-2 py-2 rounded w-full text-sm"
                      disabled={disabled}
                      placeholder="Opcional"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Cuota Prom.
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={coeff.cuotaPromedio || ''}
                      onChange={(e) => updateCoefficient(index, 'cuotaPromedio', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="border border-yellow-light bg-yellow-light px-2 py-2 rounded w-full text-sm"
                      disabled={disabled}
                      placeholder="Opcional"
                      min="0"
                    />
                  </div>
                </div>

                {/* Meses de Cuota Balón */}
                {coeff.cuotaBalon && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Meses de Cuota Balón
                    </label>
                    
                    {!disabled && (
                      <div className="mb-3">
                        <p className="text-xs text-gray mb-2">Selecciona uno o varios meses:</p>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_MONTHS.map((month) => {
                            const isSelected = (coeff.cuotaBalonMonths || []).includes(month);
                            const isDisabled = month > coeff.plazo;
                            
                            return (
                              <button
                                key={month}
                                type="button"
                                onClick={() => !isDisabled && togglePresetMonth(index, month)}
                                disabled={isDisabled}
                                className={`
                                  px-4 py-2 rounded text-sm font-medium transition-all
                                  ${isSelected 
                                    ? 'bg-blue text-white shadow-sm ring-2 ring-blue/30' 
                                    : isDisabled
                                      ? 'bg-gray/10 text-gray/40 cursor-not-allowed'
                                      : 'bg-yellow-light text-gray hover:bg-yellow-light/70 border border-gray/20'
                                  }
                                `}
                              >
                                {month}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Meses seleccionados */}
                    <div>
                      <p className="text-xs text-gray mb-2">Meses seleccionados:</p>
                      <div className="flex flex-wrap gap-2">
                        {(coeff.cuotaBalonMonths || []).length === 0 ? (
                          <span className="text-sm text-gray italic">No hay meses seleccionados</span>
                        ) : (
                          (coeff.cuotaBalonMonths || []).map((month) => (
                            <span
                              key={month}
                              className="bg-blue/10 text-blue px-3 py-1.5 rounded text-sm flex items-center gap-2 font-medium"
                            >
                              Mes {month}
                              {!disabled && (
                                <button
                                  type="button"
                                  onClick={() => removeCuotaBalonMonth(index, month)}
                                  className="hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}