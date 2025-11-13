/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateInput, createSchema, Quotation } from '@/app/types/quotition';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { useGetAllPlansQuery } from '@/app/api/planApi';
import { useCreateQuotationMutation, useUpdateQuotationMutation } from '@/app/api/quotationApi';
import CustomButton from '@/app/components/ui/customButton';
import { MultiSelect } from '@/app/components/ui/multiSelect';
import { PlanWithDetails } from '@/app/types/plan';
import { CustomInput } from '@/app/components/ui/customInput';

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

  const { data: companiesData } = useGetAllCompaniesQuery({ page: 1, limit: 1000 });
  const { data: plansData } = useGetAllPlansQuery({ page: 1, limit: 1000 });
  const [createQuotation, { isLoading: isCreating }] = useCreateQuotationMutation(); 
  const [updateQuotation,  ] = useUpdateQuotationMutation();
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateInput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      clientName: '',
      clientDni: '',
      vehicleData: '',
      totalValue: undefined,
      companyId: '',
      planId: '',
      planVersionId: '',
    },
  });

  const companies = companiesData?.data || [];

  const plans = useMemo(() => {
    if (!plansData?.data) return [];
    return (plansData.data as PlanWithDetails[]).filter((p) =>
      p.companies?.some((c) => c.id === selectedCompanyId)
    );
  }, [plansData, selectedCompanyId]);
  // 🔄 Precargar datos en modo edición / vista
  useEffect(() => {
    if (!entity) return;
    console.log(entity.totalValue)
    // Cliente
    setValue("clientName", entity.clientName || "");
    setValue("clientDni", entity.clientDni || "");
    setValue("vehicleData", entity.vehicleData || "");

    // Monto
    if (entity.totalValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMonto(Number(entity.totalValue));
      setValue("totalValue", Number(entity.totalValue));
    }

    // Compañía
    if (entity.company?.id) {
      setSelectedCompanyId(entity.company.id);
      setValue("companyId", entity.company.id);
    }

    // =============================
    //  CARGAR PLAN / VERSIÓN USADA
    // =============================
    if (entity.planVersionId && plansData?.data) {
      const allPlans = plansData.data as PlanWithDetails[];

      // Buscar plan que contiene la version usada
      const planEncontrado = allPlans.find((p) =>
        p.versions?.some((v) => v.id === entity.planVersionId)
      );

      if (planEncontrado) {
        const version = planEncontrado.versions?.find(
          (v) => v.id === entity.planVersionId
        );

        const coef = version?.coefficients?.[0];
        const plazo = coef?.plazo ?? 0;

        setSelectedPlan({
          planId: planEncontrado.id,
          planVersionId: version!.id,
          plazo,
        });

        setValue("planId", planEncontrado.id);
        setValue("planVersionId", version!.id);
      }
    }
  }, [entity, plansData, setValue]);



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
    setRequestError(null); // limpiar antes

    if (action === "edit" && entity?.id) {
      await updateQuotation({ id: entity.id, data: payload }).unwrap();
    } else {
      await createQuotation(payload).unwrap();
    }

    if (window.opener) {
      window.opener.postMessage({ created: true }, window.location.origin);
      window.close();
    }
  } catch (err: any) {
      console.log(err);
      const apiError = err  as { data:{ errors: string[]} }; 
      if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
        // Si viene un array de errores, unirlos
        setRequestError(apiError.data.errors.join(", "));
      } else { 
        setRequestError(err?.data?.message || "Error al guardar la cotizacoin");
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
      : '—';

  const plazosUnicos = Array.from(
    new Set(
      plans.flatMap((p) =>
        p.versions?.find((v) => v.isLatest)?.coefficients.map((c) => c.plazo) || []
      )
    )
  ).sort((a, b) => a - b); 

  const plansToShow = isView
    ? plans.filter((p) => p.id === selectedPlan?.planId)
    : plans;

  return (
    <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">Simulador de Cotización</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-4">
        {/* 1️⃣ Datos del Cliente */}
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3 text-black">Datos del Cliente</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              label="Nombre del Cliente"
              {...register('clientName')}
              error={errors.clientName?.message}
              placeholder="Ej: Juan Pérez"
              disabled={isView}
            />
            <CustomInput
              label="DNI"
              {...register('clientDni')}
              error={errors.clientDni?.message}
              placeholder="Ej: 30123456"
              disabled={isView}
            />
            <CustomInput
              label="Datos del vehículo (opcional)"
              {...register('vehicleData')}
              error={errors.vehicleData?.message}
              placeholder="Ej: Toyota Corolla 2.0"
              disabled={isView}
            />
          </div>
        </div>

        {/* 2️⃣ Compañía */}
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-3 text-black">Seleccionar Compañía</h2>

          <MultiSelect
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedCompanyId ? [selectedCompanyId] : []}
            onChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              setSelectedCompanyId(v);
              setValue('companyId', v); 
              setSelectedPlan(null); // reset
            }}
            placeholder="Seleccionar compañía..."
            disabled={isView}
          />

          {errors.companyId?.message && (
            <span className="text-red-500 text-sm">{errors.companyId.message}</span>
          )}
        </div>

        {/* 3️⃣ Monto */}
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
              setSelectedPlan(null); // reset
            }}
          />
        </div>

        {/* 4️⃣ Tabla de Planes */}
        {selectedCompanyId && monto > 0 && (
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4 text-black">Planes Disponibles</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="bg-gray text-white px-3 py-2 text-center w-20">Sel.</th>
                    <th className="bg-gray text-white px-3 py-2 text-left">Plan</th>

                    {plazosUnicos.map((plazo) => (
                      <th key={plazo} className="bg-gray text-white px-3 py-2 text-center">
                        {plazo} cuotas
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {plansToShow.map((plan) => {
                    const version = plan.versions?.find((v) => v.isLatest);
                    if (!version) return null;

                    return (
                      <tr key={plan.id}>
                        {/* Radio */}
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            type="radio"
                            name="planSelect"
                            checked={selectedPlan?.planId === plan.id}
                            onChange={() => {
                                setSelectedPlan({
                                  planId: plan.id,
                                  planVersionId: version.id,
                                  plazo: plazosUnicos[0],
                                });

                                setValue("planId", plan.id);
                                setValue("planVersionId", version.id); 
                              }}
                            disabled={isView}    
                          />
                        </td>

                        {/* Nombre */}
                        <td className="border border-gray-300 p-2 font-medium text-black">
                          {plan.name}
                        </td>

                        {/* Celdas de plazo */}
                        {plazosUnicos.map((plazo) => {
                          const c = version.coefficients.find((x) => x.plazo === plazo);
                          if (!c)
                            return (
                              <td
                                key={plazo}
                                className="border border-gray-300 p-2 text-center text-gray-400"
                              >
                                —
                              </td>
                            );

                          const tnaMostrar = Math.ceil(Number(c.tna));
                          const coef = Number(c.coeficiente);
                          const cuotaBase = monto * (coef / 10000);
                          const quebranto = Number(c.quebrantoFinanciero || 0);
                          const cuotaBalon = Number(c.cuotaBalon || 0);
                          const mesesBalon = c.cuotaBalonMonths?.map((m) => m.month) || [];

                          const cuotaFinal = cuotaBase + quebranto;

                          return (
                            <td
                              key={plazo}
                              className="border border-gray-300 p-2 text-center cursor-pointer"
                            >
                              <div className="text-xs text-gray-600">T.N.A. {tnaMostrar}%</div>

                              <div className="font-semibold text-green-700">
                                {formatMoney(Math.ceil(cuotaFinal))}
                              </div>

                              {quebranto > 0 && (
                                <div className="bg-gray-100 text-xs text-gray-700 p-1 mt-1 rounded">
                                  Quebranto: {formatMoney(quebranto)}
                                </div>
                              )}

                              {cuotaBalon > 0 && (
                                <div className="text-xs text-yellow-700 mt-1">
                                  {mesesBalon.length} Cuota Balón: {formatMoney(cuotaBalon)}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Errores globales del formulario */}
        {requestError && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">
            {requestError}
          </div>
        )}


        {!isView && (
          <CustomButton type="submit" disabled={isCreating}>
            {isCreating ? 'Creando...' : 'Guardar Cotización'}
          </CustomButton>
        )}
      </form>
    </div>
  );
}
