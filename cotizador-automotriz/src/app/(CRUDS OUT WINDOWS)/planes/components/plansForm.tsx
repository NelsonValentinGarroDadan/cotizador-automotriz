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
  createPlanSchema,
  updatePlanSchema,
  UpdatePlanInput
} from '@/app/types/plan';
import CustomButton from '@/app/components/ui/customButton'; 
import { MultiSelect } from '@/app/components/ui/multiSelect'; 
import CoefficientsManager from './coefficientsManager';
import { useGetUsersByCompanyQuery } from '@/app/api/userApi';
 
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG; 

interface PlanFormProps {
  entity?: PlanWithDetails;
  readOnly?: boolean;
}

export default function PlanForm({ entity, readOnly = false }: PlanFormProps) {
  const plan = entity;
  const isEdit = Boolean(plan) && !readOnly;
  const isView = Boolean(plan) && readOnly;
  
  const { data: companiesData, isLoading: isLoadingCompanies } = useGetAllCompaniesQuery({
    page: 1,
    limit: 1000,
  });
  
  const { 
    register, 
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors } 
  } = useForm<CreatePlanInput>({
    resolver: zodResolver(isEdit || isView ? updatePlanSchema : createPlanSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      companyIds: [],
      desdeMonto: undefined,
      hastaMonto: undefined,
      desdeCuota: undefined,
      hastaCuota: undefined,
      coefficients: [],
      allowedUserIds: [],
    }
  });
  
  // eslint-disable-next-line react-hooks/incompatible-library
  const companyIds = watch('companyIds'); 

  const { data: usersData } = useGetUsersByCompanyQuery(
    { companyIds },
    { skip: !companyIds || companyIds.length === 0 }
  );

  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(plan?.active ?? true);

  // Cargar estado activo al editar
  useEffect(() => {
    if (plan) {
      setIsActive(plan.active);
    }
  }, [plan]);

  // Cargar datos del plan al editar/ver
  useEffect(() => {
    if (plan) {
      const latestVersion = plan.versions?.find(v => v.isLatest);
      
      reset({
        name: plan.name,
        description: plan.description || '',
        companyIds: plan.companies?.map(c => c.id) || [],
        desdeMonto: latestVersion?.desdeMonto || undefined,
        hastaMonto: latestVersion?.hastaMonto || undefined,
        desdeCuota: latestVersion?.desdeCuota || undefined,
        hastaCuota: latestVersion?.hastaCuota || undefined,
        coefficients: latestVersion?.coefficients.map(c => ({
          plazo: c.plazo,
          tna: c.tna,
          coeficiente: c.coeficiente,
          quebrantoFinanciero: c.quebrantoFinanciero,
          cuotaBalon: c.cuotaBalon || undefined,
          cuotaPromedio: c.cuotaPromedio || undefined,
          cuotaBalonMonths: c.cuotaBalonMonths.map(m => m.month),
        })) || [],
        allowedUserIds: plan.allowedUsers?.map(u => u.id) || [],
      });
    }
  }, [plan, reset]);

  // Precargar compañía cuando el usuario solo tiene una al crear
  useEffect(() => {
    const availableCompanies = companiesData?.data || [];
    if (!isView && !isEdit && availableCompanies.length === 1 && (!companyIds || companyIds.length === 0)) {
      setValue('companyIds', [availableCompanies[0].id]);
    }
  }, [companiesData, isView, isEdit, companyIds, setValue]);

  const onSubmit = async (data: CreatePlanInput | UpdatePlanInput) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name!);
      if (data.description) formData.append('description', data.description);
      
      // Agregar companyIds
      formData.append('companyIds', JSON.stringify(data.companyIds));
      formData.append('active', String(isActive));
 
      // Solo en creación
      const fullData = data as CreatePlanInput;
      if (fullData.desdeMonto !== undefined) formData.append('desdeMonto', fullData.desdeMonto.toString());
      if (fullData.hastaMonto !== undefined) formData.append('hastaMonto', fullData.hastaMonto.toString());
      if (fullData.desdeCuota !== undefined) formData.append('desdeCuota', fullData.desdeCuota.toString());
      if (fullData.hastaCuota !== undefined) formData.append('hastaCuota', fullData.hastaCuota.toString());
      
      // Agregar allowedUserIds (siempre)
      if (data.allowedUserIds) {
        formData.append('allowedUserIds', JSON.stringify(data.allowedUserIds));
      } else {
        formData.append('allowedUserIds', JSON.stringify([]));
      }

      formData.append('coefficients', JSON.stringify(fullData.coefficients));
    
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
      console.log(err);
      const apiError = err  as { data:{ errors: string[]} }; 
      if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
        setError(apiError.data.errors.join(', '));
      } else { 
        setError(err?.data?.message || 'Error al guardar el plan');
      }
    }
  };

  const availableCompanies = companiesData?.data || [];

  // Compañías visibles del plan según las compañías disponibles para el usuario
  const visiblePlanCompanies =
    plan?.companies?.filter((company) =>
      availableCompanies.some((available) => available.id === company.id)
    ) || [];

  if (isLoadingCompanies) {
    return (
      <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth flex items-center justify-center">
        <p className="text-gray">Cargando compañías...</p>
      </div>
    );
  }

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

  const companyOptions = availableCompanies.map((c: any) => ({
    value: c.id,
    label: c.name,
  }));
  
  const userOptions = (usersData?.data || []).map((u: any) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName}`,
  }));

  const selectedUserNames =
    plan?.allowedUsers?.map((u) => `${u.firstName} ${u.lastName}`) || [];

  return (
    <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
        {isView ? 'Ver Plan' : isEdit ? 'Editar Plan' : 'Crear Plan'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        {/* Información Básica */}
        <div className="bg-white p-4 rounded border">
          <h2 className="text-lg font-semibold mb-4 text-black">Información Básica</h2> 
          {isEdit && (
            <div className="flex items-center justify-between bg-white border rounded p-3">
              <label className="text-black font-medium">Estado del plan</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-blue cursor-pointer"
                />
                <label htmlFor="active-toggle" className="text-sm text-gray-700 cursor-pointer">
                  {isActive ? 'Activo' : 'Inactivo'}
                </label>
              </div>
            </div>
          )}
 
          <div className="space-y-4">
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
                className={`resize-none border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full outline-none focus:ring-2 focus:ring-blue/60 min-h-[100px] ${
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
                Compañías <span className="text-red-500">*</span>
              </label>
              {isView && plan ? (
                <div className="border border-gray/50 px-3 py-2 rounded bg-gray/5 min-h-[42px]">
                  {visiblePlanCompanies.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {visiblePlanCompanies.map((company) => (
                        <li key={company.id} className="text-sm">
                          {company.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray/60">Sin compañías asignadas</span>
                  )}
                </div>
              ) : (
                <MultiSelect
                  options={companyOptions} 
                  value={watch('companyIds') || []}
                  onChange={(value) => setValue('companyIds', value)}
                  placeholder="Seleccionar compañías..."
                />
              )}
              {errors.companyIds?.message && (
                <span className="text-red-500 text-sm">{errors.companyIds.message}</span>
              )}
            </div>
              
            {/* Sección de Permisos de Usuarios */}
            <div className="bg-white p-4 rounded border">
              <h2 className="text-lg font-semibold mb-4 text-black">
                Permisos de Usuarios
              </h2>

              {isView ? (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Usuarios que pueden ver este plan
                  </label>
                  <div className="border border-gray/50 px-3 py-2 rounded bg-gray/5 min-h-[42px]">
                    {selectedUserNames.length === 0 ? (
                      <span className="text-gray/60">Sin usuarios asignados</span>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {selectedUserNames.map((name, idx) => (
                          <li key={idx} className="text-sm">
                            {name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-black mb-1">
                    Usuarios que pueden ver este plan
                  </label>

                  <MultiSelect
                    options={userOptions}
                    value={watch('allowedUserIds') || []}
                    onChange={(value) => setValue('allowedUserIds', value)}
                    placeholder="Seleccionar usuarios..."
                  />

                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue(
                            'allowedUserIds',
                            userOptions.map((u: any) => u.value)
                          );
                        } else {
                          setValue('allowedUserIds', []);
                        }
                      }}
                    />
                    <span>Lo ven todos</span>
                  </div>
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
                  className="mx-auto h-40 object-contain border rounded"
                />
              </div>
            )}
          </div>
        </div>

        {/* Restricciones (creación y edición) */}
        {!isView && (
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Restricciones (opcional)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Monto Desde
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('desdeMonto')}
                  className="border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full"
                  placeholder="Ej: 50000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Monto Hasta
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('hastaMonto')}
                  className="border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full"
                  placeholder="Ej: 500000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Cuota Desde
                </label>
                <input
                  type="number"
                  {...register('desdeCuota')}
                  className="border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full"
                  placeholder="Ej: 6"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Cuota Hasta
                </label>
                <input
                  type="number"
                  {...register('hastaCuota')}
                  className="border border-yellow-light bg-yellow-light px-3 py-2 rounded w-full"
                  placeholder="Ej: 84"
                  min="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Coeficientes (creación y edición) */}
        {!isView && (
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Coeficientes <span className="text-red-500">*</span>
            </h2>
            <CoefficientsManager 
              setValue={setValue} 
              watch={watch}
              disabled={false}
            />
          </div>
        )}

        {/* Información adicional en modo vista */}
        {isView && plan && (
          <>
            <div className="bg-white p-4 rounded border">
              <h2 className="text-lg font-semibold mb-4 text-black">Información del Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray mb-1">
                    Estado
                  </label>
                  <p className="text-sm font-medium">
                    {plan.active ? (
                      <span className="text-green-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </p>
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
                    Total de Versiones
                  </label>
                  <p className="text-sm font-medium">
                    {plan._count?.versions || 0} versiones
                  </p>
                </div>
              </div>
            </div>

            {plan.versions && plan.versions.length > 0 && (
              <div className="bg-white p-4 rounded border">
                <h2 className="text-lg font-semibold mb-4 text-black">Versiones</h2>
                <div className="space-y-3">
                  {plan.versions.map((version) => (
                    <div
                      key={version.id}
                      className="border border-gray/40 rounded p-3 bg-gray/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            Versión {version.versionNumber}
                          </span>
                          {version.isLatest && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                              Última versión
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray">
                          {new Date(version.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <p className="text-xs text-gray mb-2">
                        Creada por {version.createdBy.firstName} {version.createdBy.lastName}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="font-medium">Monto desde:</span>{' '}
                          {version.desdeMonto ?? '-'}
                        </div>
                        <div>
                          <span className="font-medium">Monto hasta:</span>{' '}
                          {version.hastaMonto ?? '-'}
                        </div>
                        <div>
                          <span className="font-medium">Cuota desde:</span>{' '}
                          {version.desdeCuota ?? '-'}
                        </div>
                        <div>
                          <span className="font-medium">Cuota hasta:</span>{' '}
                          {version.hastaCuota ?? '-'}
                        </div>
                      </div>

                      {version.coefficients?.length ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs border border-gray/40 rounded">
                            <thead className="bg-gray/10 text-gray-700">
                              <tr>
                                <th className="px-2 py-1 text-left">Plazo</th>
                                <th className="px-2 py-1 text-left">TNA</th>
                                <th className="px-2 py-1 text-left">Coef.</th>
                                <th className="px-2 py-1 text-left">Quebranto</th>
                                <th className="px-2 py-1 text-left">Cuota Balón</th>
                                <th className="px-2 py-1 text-left">Meses Balón</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...(version.coefficients || [])]
                                .sort((a, b) => a.plazo - b.plazo)
                                .map((coeff) => (
                                  <tr key={coeff.id} className="border-t border-gray/30">
                                    <td className="px-2 py-1">{coeff.plazo} m</td>
                                    <td className="px-2 py-1">{coeff.tna}%</td>
                                    <td className="px-2 py-1">{coeff.coeficiente}</td>
                                    <td className="px-2 py-1">{coeff.quebrantoFinanciero ?? '-'}</td>
                                    <td className="px-2 py-1">{coeff.cuotaBalon ?? '-'}</td>
                                    <td className="px-2 py-1">
                                      {(coeff.cuotaBalonMonths || []).length
                                        ? coeff.cuotaBalonMonths.map((m) => m.month).join(', ')
                                        : '-'}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-gray mt-2">Sin coeficientes cargados.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-2">
            {error}
          </p>
        )}

        {!isView && (
          <div className="flex justify-end mt-4">
            <CustomButton
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {isEdit ? (isUpdating ? 'Guardando...' : 'Guardar cambios') : isCreating ? 'Creando...' : 'Crear Plan'}
            </CustomButton>
          </div>
        )}
      </form>
    </div>
  );
}
