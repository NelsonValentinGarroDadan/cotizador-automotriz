/* eslint-disable react-hooks/exhaustive-deps */ 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { CreateInput, createSchema, Quotation } from '@/app/types/quotition';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { useGetAllPlansQuery } from '@/app/api/planApi';
import { useCreateQuotationMutation, useUpdateQuotationMutation } from '@/app/api/quotationApi';
import CustomButton from '@/app/components/ui/customButton';
import { MultiSelect } from '@/app/components/ui/multiSelect';
import { PlanWithDetails } from '@/app/types/plan';
import { CustomInput } from '@/app/components/ui/customInput';
import { SelectSearch, SelectSearchOption } from '@/app/components/ui/selectSearch'; 
import { vehiculeApi } from '@/app/api/vehiculeApi';

export default function QuotationForm({
  entity,
  readOnly,
}: {
  entity?: Quotation;
  readOnly?: boolean;
}) {
  const action = entity ? (readOnly ? 'view' : 'edit') : 'create';
  const isView = action === 'view';

  const [monto, setMonto] = useState<number>(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const [selectedPlan, setSelectedPlan] = useState<{
    planId: string;
    planVersionId: string;
    plazo: number;
  } | null>(null);
  const [showSoloAplicables, setShowSoloAplicables] = useState<boolean>(false);

  const { data: companiesData } = useGetAllCompaniesQuery({ page: 1, limit: 1000 });
  const { data: plansData } = useGetAllPlansQuery({ page: 1, limit: 1000 , sortOrder: 'asc'});
  const [createQuotation, { isLoading: isCreating }] = useCreateQuotationMutation();
  const [updateQuotation] = useUpdateQuotationMutation();
  const [requestError, setRequestError] = useState<string | null>(null); 
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateInput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      clientName: '',
      clientDni: '',
      totalValue: undefined,
      companyId: '',
      planId: '',
      planVersionId: '',
      vehicleVersionId: undefined as unknown as number,
    },
  });

  const companies = companiesData?.data || [];
  const vehicleVersionId = watch('vehicleVersionId') as number | undefined;

  const plans = useMemo(() => {
    if (!plansData?.data) return [];
    return (plansData.data as PlanWithDetails[]).filter((p) =>
      p.companies?.some((c) => c.id === selectedCompanyId),
    );
  }, [plansData, selectedCompanyId]);

  const isMontoWithinVersionRange = (
    version: NonNullable<PlanWithDetails['versions']>[number],
    amount: number,
  ) => {
    if (version.desdeMonto !== null && version.desdeMonto !== undefined && amount < Number(version.desdeMonto)) {
      return false;
    }
    if (version.hastaMonto !== null && version.hastaMonto !== undefined && amount > Number(version.hastaMonto)) {
      return false;
    }
    return true;
  };

  const isPlazoWithinVersionRange = (
    version: NonNullable<PlanWithDetails['versions']>[number],
    plazo: number,
  ) => {
    if (version.desdeCuota !== null && version.desdeCuota !== undefined && plazo < Number(version.desdeCuota)) {
      return false;
    }
    if (version.hastaCuota !== null && version.hastaCuota !== undefined && plazo > Number(version.hastaCuota)) {
      return false;
    }
    return true;
  };

  // Precargar datos en modo edicion / vista
  useEffect(() => {
    if (!entity) return;

    setValue('clientName', entity.clientName || '');
    setValue('clientDni', entity.clientDni || '');

    if (entity.totalValue) {
      setMonto(Number(entity.totalValue));
      setValue('totalValue', Number(entity.totalValue));
    }

    if (entity.company?.id) {
      setSelectedCompanyId(entity.company.id);
      setValue('companyId', entity.company.id);
    }

    if (entity.vehicleVersion?.idversion) {
      setValue('vehicleVersionId', entity.vehicleVersion.idversion);
    }

    if (entity.planVersionId && plansData?.data) {
      const allPlans = plansData.data as PlanWithDetails[];

      const planEncontrado = allPlans.find((p) =>
        p.versions?.some((v) => v.id === entity.planVersionId),
      );

      if (planEncontrado) {
        const version = planEncontrado.versions?.find((v) => v.id === entity.planVersionId);
        const coef = version?.coefficients?.[0];
        const plazo = coef?.plazo ?? 0;

        setSelectedPlan({
          planId: planEncontrado.id,
          planVersionId: version!.id,
          plazo,
        });

        setValue('planId', planEncontrado.id);
        setValue('planVersionId', version!.id);
      }
    }
  }, [entity, plansData, setValue]);

  // Preseleccionar compania si solo hay una
  useEffect(() => {
    if (!selectedCompanyId && companies.length === 1) {
      const onlyCompany = companies[0];
      setSelectedCompanyId(onlyCompany.id);
      setValue('companyId', onlyCompany.id);
    }
  }, [companies, selectedCompanyId, setValue]);

  const onSubmit = async (data: CreateInput) => {
    if (!selectedPlan) {
      alert('Debes seleccionar un plan.');
      return;
    }

    const payload = {
      ...data,
      totalValue: monto,
      planId: selectedPlan.planId,
      planVersionId: selectedPlan.planVersionId,
      plazo: selectedPlan.plazo,
    };

    try {
      setRequestError(null);

      if (action === 'edit' && entity?.id) {
        await updateQuotation({ id: entity.id, data: payload }).unwrap();
      } else {
        await createQuotation(payload).unwrap();
      }

      if (window.opener) {
        window.opener.postMessage({ created: true }, window.location.origin);
        window.close();
      }
    } catch (err: any) {
      const apiError = err as { data: { errors: string[] } };
      if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
        setRequestError(apiError.data.errors.join(', '));
      } else {
        setRequestError(err?.data?.message || 'Error al guardar la cotizacion');
      }
    }
  };

  const formatMoney = (n?: number) =>
    n !== undefined
      ? n.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
        })
      : '$0';

  const plazosUnicos = useMemo(
    () =>
      Array.from(
        new Set(
          plans.flatMap((p) =>
            p.versions?.find((v) => v.isLatest)?.coefficients.map((c) => c.plazo) || [],
          ),
        ),
      ).sort((a, b) => a - b),
    [plans],
  );

  const plansToShow = isView
    ? plans.filter((p) => p.id === selectedPlan?.planId)
    : plans;

  return (
    <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
        Simulador de Cotizacion
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-4">
        {/* 1. Datos del Cliente */}
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3 text-black">Datos del Cliente</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              label="Nombre del Cliente"
              {...register('clientName')}
              error={errors.clientName?.message}
              placeholder="Ej: Juan Perez"
              disabled={isView}
            />
            <CustomInput
              label="DNI"
              {...register('clientDni')}
              error={errors.clientDni?.message}
              placeholder="Ej: 30123456"
              disabled={isView}
            />
          </div>
        </div>

        {/* 2. Compania */}
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3 text-black">Seleccionar Compania</h2>

          <MultiSelect
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedCompanyId ? [selectedCompanyId] : []}
            onChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              setSelectedCompanyId(v);
              setValue('companyId', v);
              setSelectedPlan(null);
              setValue('vehicleVersionId', undefined as unknown as number);
            }}
            placeholder="Seleccionar compañia..."
            disabled={isView}
          />

          {errors.companyId?.message && (
            <span className="text-red-500 text-sm">{errors.companyId.message}</span>
          )}
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3 text-black">Seleccionar Vehiculo</h2>

          <SelectSearch
            value={vehicleVersionId ? String(vehicleVersionId) : undefined}
            onChange={(val) =>
              setValue(
                'vehicleVersionId',
                val ? Number(val) : undefined,
              )
            }
            loadOptions={async (search: string): Promise<SelectSearchOption[]> => {
              if (!selectedCompanyId) return [];
              const result = (await (dispatch as any)(
                vehiculeApi.endpoints.getAllVehiculeVersions.initiate({
                  limit: 50,
                  companyId: selectedCompanyId,
                  search: search || undefined,
                })
              ).unwrap()) as { data?: any[] };

              return (result.data || []).map((v: any) => {
                const parts = [
                  v.nueva_descrip || v.descrip,
                  v.marca?.descrip,
                  v.modelo?.linea?.descrip,
                  v.modelo?.descrip,
                ].filter(Boolean);

                return {
                  value: String(v.idversion),
                  label: parts.join(" - "),
                };
              });
            }}
            placeholder={
              selectedCompanyId
                ? 'Seleccionar vehiculo...'
                : 'Selecciona primero una compania'
            }
            disabled={isView || !selectedCompanyId}
          />

          {errors.vehicleVersionId?.message && (
            <span className="text-red-500 text-sm">
              {errors.vehicleVersionId.message}
            </span>
          )}
        </div>

        {/* 4. Monto */}
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3 text-black">Monto a Financiar</h2>

          <input
            type="number"
            className="border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full"
            placeholder="Ej: 12000000"
            value={monto}
            disabled={isView}
            onChange={(e) => {
              setMonto(Number(e.target.value));
              setSelectedPlan(null);
            }}
          />
        </div>

        {/* 5. Tabla de Planes */}
        {selectedCompanyId && monto > 0 && !!vehicleVersionId && (
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4 text-black">Planes Disponibles</h2>

            <div className="flex items-center justify-between mb-2 text-xs text-gray-700">
              <span>
                Monto ingresado: <strong>{formatMoney(monto)}</strong>
              </span>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSoloAplicables}
                  onChange={(e) => setShowSoloAplicables(e.target.checked)}
                  className="accent-gray"
                  disabled={isView}
                />
                Mostrar solo planes aplicables
              </label>
            </div>

            <div className="overflow-auto max-h-[60vh] relative">
              <table className="relative w-full border-collapse text-sm min-w-[720px]">
                <thead className='sticky top-0 z-10 bg-gray '>
                  <tr>
                    <th className="text-white px-3 py-2 text-center w-20 sticky top-0 z-10">
                      Sel.
                    </th>
                    <th className="text-white px-3 py-2 text-left sticky top-0 z-10 border-l border-white ">
                      Plan
                    </th>
                    {plazosUnicos.map((plazo) => (
                      <th
                        key={plazo}
                        className="text-white px-3 py-2 text-center sticky top-0 z-10 border-l  border-white"
                      >
                        {plazo} <br/>cuotas
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plansToShow.map((plan, idx) => {
                    const version = plan.versions?.find((v) => v.isLatest);
                    if (!version) return null;

                    const montoValido = isMontoWithinVersionRange(version, monto);

                    const plazosValidos = version.coefficients
                      .map((c) => c.plazo)
                      .filter((plazo) => montoValido && isPlazoWithinVersionRange(version, plazo))
                      .sort((a, b) => a - b);

                    const tieneAlgunaCuotaValida = plazosValidos.length > 0;
                    const esPlanAplicable = montoValido && tieneAlgunaCuotaValida;

                    const desdeMonto = version.desdeMonto !== null && version.desdeMonto !== undefined
                      ? Number(version.desdeMonto)
                      : undefined;
                    const hastaMonto = version.hastaMonto !== null && version.hastaMonto !== undefined
                      ? Number(version.hastaMonto)
                      : undefined;

                    let reasonText: string | null = null;
                    if (!montoValido && (desdeMonto !== undefined || hastaMonto !== undefined)) {
                      if (desdeMonto !== undefined && hastaMonto !== undefined) {
                        reasonText = `Monto fuera de rango. Permitido entre ${formatMoney(desdeMonto)} y ${formatMoney(hastaMonto)}.`;
                      } else if (desdeMonto !== undefined) {
                        reasonText = `Monto fuera de rango. Debe ser desde ${formatMoney(desdeMonto)}.`;
                      } else if (hastaMonto !== undefined) {
                        reasonText = `Monto fuera de rango. Debe ser hasta ${formatMoney(hastaMonto)}.`;
                      }
                    } else if (montoValido && !tieneAlgunaCuotaValida) {
                      const desdeCuota = version.desdeCuota ?? undefined;
                      const hastaCuota = version.hastaCuota ?? undefined;
                      if (desdeCuota !== undefined && hastaCuota !== undefined) {
                        reasonText = `No hay plazos disponibles para este monto. Solo se permiten entre ${desdeCuota} y ${hastaCuota} cuotas.`;
                      } else if (desdeCuota !== undefined) {
                        reasonText = `No hay plazos disponibles para este monto. Se permiten desde ${desdeCuota} cuotas.`;
                      } else if (hastaCuota !== undefined) {
                        reasonText = `No hay plazos disponibles para este monto. Se permiten hasta ${hastaCuota} cuotas.`;
                      } else {
                        reasonText = 'No hay plazos disponibles para este monto segun las restricciones del plan.';
                      }
                    }

                    if (showSoloAplicables && !esPlanAplicable) {
                      return null;
                    }

                    if (!esPlanAplicable && reasonText) {
                      return (
                        <React.Fragment key={plan.id}>
                          <tr className="bg-gray/30 ">
                            <td className="border border-gray-300 p-2 text-center">
                              <input
                                type="radio"
                                name="planSelect"
                                checked={selectedPlan?.planId === plan.id}
                                onChange={() => {}}
                                disabled
                              />
                            </td>
                            <td className="border border-gray-300 p-2 font-medium text-black">
                              <div>{plan.name}</div>
                            </td>
                            <td
                              className="border border-gray-300 px-3 py-2 text-xs text-gray-800 text-left"
                              colSpan={plazosUnicos.length}
                            >
                              <span className="font-semibold">{plan.name}:</span> {reasonText}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={plan.id}>
                        <tr
                          className={
                            idx % 2 === 0
                              ? 'bg-gray-50'
                              : 'bg-white'
                          }
                        >
                          {/* Radio */}
                          <td className="border border-gray-300 p-2 text-center">
                            <input
                              type="radio"
                              name="planSelect"
                              checked={selectedPlan?.planId === plan.id}
                              onChange={() => {
                                const primerPlazo = plazosValidos[0];
                                setSelectedPlan({
                                  planId: plan.id,
                                  planVersionId: version.id,
                                  plazo: primerPlazo,
                                });
                                setValue('planId', plan.id);
                                setValue('planVersionId', version.id);
                              }}
                              disabled={isView || !tieneAlgunaCuotaValida}
                            />
                          </td>

                          {/* Nombre */}
                          <td className="border border-gray-300 p-2 font-medium text-black">
                            <div>{plan.name}</div>
                          </td>

                          {/* Celdas de plazo */}
                          {plazosUnicos.map((plazo) => {
                            const c = version.coefficients.find((x) => x.plazo === plazo);
                            const esPlanCheques = plan.name.toUpperCase().includes('CHEQUES');
                            const cantidadCheques = plazo + 1;

                            const plazoValido =
                              !!c &&
                              montoValido &&
                              isPlazoWithinVersionRange(version, plazo);

                            if (!plazoValido) {
                              return (
                                <td
                                  key={`${plan.id}-${plazo}-na`}
                                  className="border border-gray-300 p-2 text-center text-gray-400"
                                >
                                  -
                                </td>
                              );
                            }

                            const tnaMostrar = Math.ceil(Number(c.tna));
                            const coef = Number(c.coeficiente);
                            const cuotaFinal = monto * (coef / 10000);
                            const quebrantoPorcentaje = Number(c.quebrantoFinanciero || 0) / 100;
                            const factorQuebranto = 1.21;
                            const quebranto = Math.ceil(monto * quebrantoPorcentaje * factorQuebranto);

                            const cuotaBalon = Number(c.cuotaBalon || 0);
                            const mesesBalon = c.cuotaBalonMonths?.map((m) => m.month) || [];

                            return (
                              <td
                                key={`${plan.id}-${plazo}`}
                                className="border border-gray-300 p-2 text-center cursor-pointer"
                              >
                                <div className="text-xs text-gray-600">T.N.A. {tnaMostrar}%</div>

                                <div className="font-semibold text-green-700">
                                  {formatMoney(Math.ceil(cuotaFinal))}
                                </div>

                                {esPlanCheques && (
                                  <div className="text-xs text-blue-700 mt-1">
                                    {cantidadCheques} cheques de {formatMoney(Math.ceil(cuotaFinal))},{' '}
                                    (1ro Corriente)
                                  </div>
                                )}

                                {!esPlanCheques && quebranto > 0 && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Quebranto: {formatMoney(quebranto)}
                                  </div>
                                )}

                                {cuotaBalon > 0 && (
                                  <div className="text-xs text-amber-700 mt-1">
                                    Cuota Balon: {formatMoney(cuotaBalon)} meses: {mesesBalon.join(', ')}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {requestError && (
          <div className="text-red-500 text-sm mt-2">{requestError}</div>
        )}

        {!isView && (
          <div className="flex justify-end gap-4 mt-4">
            <CustomButton
              type="button"
              onClick={() => window.close()}
              className="bg-gray hover:bg-gray/80"
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" disabled={isCreating}>
              {action === 'edit' ? 'Actualizar' : 'Crear'}
            </CustomButton>
          </div>
        )}
      </form>
    </div>
  );
}
