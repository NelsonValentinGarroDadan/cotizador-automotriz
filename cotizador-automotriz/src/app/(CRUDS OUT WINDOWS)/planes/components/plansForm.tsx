/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/planes/components/PlanForm.tsx
'use client';
import { useForm } from 'react-hook-form';  
import { CustomInput } from '@/app/components/ui/customInput';
import { 
  useCreatePlanMutation, 
  useUpdatePlanMutation,
} from '@/app/api/planApi';  
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';  
import { 
  CreatePlanInput, 
  PlanWithDetails, 
  createPlanSchema 
} from '@/app/types/plan';
import CustomButton from '@/app/components/ui/customButton';  
 
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG; 

interface PlanFormProps {
  entity?: PlanWithDetails;
  readOnly?: boolean;
}

export default function PlanForm({ entity, readOnly = false }: PlanFormProps) {
  const plan = entity;
  const isEdit = Boolean(plan) && !readOnly;
  const isView = Boolean(plan) && readOnly; 
  const { data: companiesData, isLoading: isLoadingCompanies  } = useGetAllCompaniesQuery({
    page: 1,
    limit: 1000,
  });
  
  const { 
    register, 
    handleSubmit,
    reset,
    formState: { errors } 
  } = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      companyId: '',
    }
  });

  const [createPlan, { isLoading: isCreating}] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating}] = useUpdatePlanMutation();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Cargar datos del plan al editar/ver
  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        description: plan.description || '',
        companyId: plan.companyId,
      });
    }
  }, [plan, reset]);

  const onSubmit = async (data: CreatePlanInput) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('companyId', data.companyId);
      
      if (file) {
        formData.append('logo', file);
      }

      if (isEdit && plan) {
        await updatePlan({ id: plan.id, data: formData }).unwrap();
      } else {
        await createPlan(formData).unwrap();
      }

      if (window.opener) {
        window.opener.postMessage(
          { [isEdit ? 'updated' : 'created']: true }, 
          window.location.origin
        );
        window.close();
      }
    } catch (err: any) {
      console.log('❌ Error en la creación/actualización:', err); 

      const apiError = err?.data?.error;

      if (Array.isArray(apiError)) {
        setError(apiError.join(', '));
      } else if (typeof apiError === 'string') {
        setError(apiError);
      } else {
        setError('Ocurrió un error al procesar la solicitud');
      }
    }
  };

  // ✅ Las compañías disponibles vienen del backend (ya filtradas por el usuario)
  const availableCompanies = companiesData?.data || [];

  // ✅ Loading de compañías
  if (isLoadingCompanies) {
    return (
      <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth flex items-center justify-center">
        <p className="text-gray">Cargando compañías...</p>
      </div>
    );
  }

  // ✅ Sin compañías disponibles
  if (!isView && availableCompanies.length === 0) {
    return (
      <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
        <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
          {isEdit ? 'Editar Plan' : 'Crear Plan'}
        </h1>
        <div className="p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-medium">No tienes compañías asignadas</p>
            <p className="text-sm mt-1">
              Para crear planes, primero debes tener compañías asignadas a tu cuenta.
            </p>
          </div>
          <CustomButton
            type="button"
            onClick={() => window.close()}
            className="mt-4"
          >
            Cerrar
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
        {isView ? 'Ver Plan' : isEdit ? 'Editar Plan' : 'Crear Plan'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        <CustomInput
          label="Nombre del Plan"
          {...register('name')}
          error={errors.name?.message}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
          placeholder="Ej: Plan Premium"
          disabled={isView}
        />

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Descripción (opcional)
          </label>
          <textarea
            {...register('description')}
            className={`border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60 min-h-[100px] ${
              isView ? 'cursor-not-allowed opacity-60' : ''
            }`}
            placeholder="Descripción del plan..."
            disabled={isView}
          />
          {errors.description?.message && (
            <span className="text-red-500 text-sm">{errors.description.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Compañía
          </label>
          {isView && plan ? (
            // ✅ En modo vista, solo mostrar el nombre
            <div className="border border-gray/50 px-3 py-2 rounded bg-gray/5 min-h-[42px]">
              <p className="text-sm">{plan.company?.name || '-'}</p>
            </div>
          ) : (
            // ✅ En modo edición/creación, mostrar select
            <>
              <select
                {...register('companyId')}
                className="border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60"
              >
                <option value="">Seleccionar compañía...</option>
                {availableCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId?.message && (
                <span className="text-red-500 text-sm">{errors.companyId.message}</span>
              )}
            </>
          )}
        </div>

        {!isView && (
          <CustomInput
            label="Logo del plan (opcional)"
            type="file"
            id="logo-upload"
            onFileChange={setFile}
            defaultImage={plan?.logo ? baseUrl + plan.logo : undefined}
            inputClassName="!border-yellow-light bg-yellow-light"
            labelClassName="!text-black"
          />
        )}

        {isView && plan?.logo && (
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Logo
            </label>
            <img
              src={baseUrl + plan.logo}
              alt="Logo del plan"
              className="mx-auto h-32 border rounded"
            />
          </div>
        )}

        {isView && plan && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray/5 rounded">
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Compañía
              </label>
              <p className="text-sm font-medium">{plan.company?.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Creado por
              </label>
              <p className="text-sm">
                {plan.createdBy?.firstName} {plan.createdBy?.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Fecha de creación
              </label>
              <p className="text-sm">
                {new Date(plan.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Versiones
              </label>
              <p className="text-sm font-medium">
                {plan._count?.versions || 0} versiones creadas
              </p>
            </div>
            
            {plan.versions && plan.versions.length > 0 && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray mb-2">
                  Últimas versiones
                </label>
                <div className="space-y-2">
                  {plan.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-2 bg-white border rounded"
                    >
                      <div>
                        <span className="font-medium">Versión {version.version}</span>
                        {version.isLatest && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Actual
                          </span>
                        )}
                        <p className="text-xs text-gray">
                          Creada por {version.createdBy.firstName} {version.createdBy.lastName}
                        </p>
                      </div>
                      <span className="text-xs text-gray">
                        {new Date(version.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!isView && (
          <CustomButton type="submit" disabled={isCreating || isUpdating}>
            {isEdit 
              ? (isUpdating ? 'Actualizando...' : 'Actualizar') 
              : (isCreating ? 'Creando...' : 'Crear')
            }
          </CustomButton>
        )}

        {isView && (
          <CustomButton
            type="button"
            onClick={() => window.close()}
          >
            Cerrar
          </CustomButton>
        )}
      </form>
    </div>
  );
}