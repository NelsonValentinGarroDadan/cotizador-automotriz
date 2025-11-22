/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CustomButton from '@/app/components/ui/customButton';
import { CustomInput } from '@/app/components/ui/customInput';
import { MultiSelect } from '@/app/components/ui/multiSelect';
import { SelectSearch, SelectSearchOption } from '@/app/components/ui/selectSearch';
import {
  useCreateVehiculeVersionMutation,
  useUpdateVehiculeVersionMutation,
  vehiculeApi,
} from '@/app/api/vehiculeApi';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { useDispatch } from 'react-redux';
import { VehiculeVersion, VehiculeVersionPayload } from '@/app/types/vehiculos';

interface VehiculeFormProps {
  entity?: VehiculeVersion;
  readOnly?: boolean;
}

export default function VehiculeForm({ entity, readOnly = false }: VehiculeFormProps) {
  const isEdit = Boolean(entity) && !readOnly;
  const isView = Boolean(entity) && readOnly;

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehiculeVersionPayload>({
    defaultValues: {
      companyIds: [],
    },
  });

  const { data: companiesData } = useGetAllCompaniesQuery({
    page: 1,
    limit: 1000,
  });

  const [loadingBrand, setLoadingBrand] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyIds = watch('companyIds');
  const brandId = watch('brandId');

  // Cargar datos del vehículo al editar/ver
  useEffect(() => {
    if (entity && companiesData?.data) {
      const availableCompanies = companiesData.data;
      const assignedCompanies =
        entity.company
          ?.filter((c) => availableCompanies.some((ac: any) => ac.id === c.id))
          .map((c) => c.id) || [];

      reset({
        descrip: entity.descrip,
        nueva_descrip: entity.nueva_descrip,
        codigo: entity.codigo,
        companyIds: assignedCompanies,
        brandId: entity.marca.idmarca,
        modelId: entity.modelo.idmodelo,
      });
    }
  }, [entity, companiesData, reset]);

  // Refuerzo: asegurar que brandId se setee en edición aunque el reset se haya perdido
  useEffect(() => {
    if (entity && entity.marca?.idmarca && !brandId) {
      setValue('brandId', entity.marca.idmarca);
    }
  }, [entity, brandId, setValue]);

  // Precargar compañía cuando el usuario solo tiene una al crear
  useEffect(() => {
    const availableCompanies = companiesData?.data || [];
    if (
      !isView &&
      !isEdit &&
      availableCompanies.length === 1 &&
      (!companyIds || companyIds.length === 0)
    ) {
      reset((prev) => ({
        ...prev,
        companyIds: [availableCompanies[0].id],
      }));
    }
  }, [companiesData, isView, isEdit, companyIds, reset]);

  const firstCompanyId =
    Array.isArray(companyIds) && companyIds.length > 0 ? companyIds[0] : undefined;

  const loadBrands = async (search: string): Promise<SelectSearchOption[]> => {
    setLoadingBrand(true);
    try {
      const result = await (dispatch as any)(
        vehiculeApi.endpoints.getVehiculeBrands.initiate({
          sortBy:'desc',
          sortOrder:'asc', 
          search: search || undefined,
          companyId: firstCompanyId,
        })
      ).unwrap();

      return (result.data || []).map((b: any) => ({
        value: String(b.idmarca),
        label: b.descrip,
      }));
    } finally {
      setLoadingBrand(false);
    }
  };

  const loadModels = async (search: string): Promise<SelectSearchOption[]> => {
    setLoadingModel(true);
    try {
      const result = await (dispatch as any)(
        vehiculeApi.endpoints.getVehiculeModels.initiate({ 
          sortBy:'desc',
          sortOrder:'asc', 
          brandId: brandId || undefined,
          search: search || undefined,
          companyId: firstCompanyId,
        })
      ).unwrap();

      return (result.data || []).map((m: any) => ({
        value: String(m.idmodelo),
        label: m.linea?.descrip
          ? `${m.descrip} (${m.linea.descrip})`
          : m.descrip,
      }));
    } finally {
      setLoadingModel(false);
    }
  };

  const companyOptions =
    companiesData?.data.map((c: any) => ({
      value: c.id,
      label: c.name,
    })) || [];

  const [createVehicule, { isLoading: isCreating }] =
    useCreateVehiculeVersionMutation();
  const [updateVehicule, { isLoading: isUpdating }] =
    useUpdateVehiculeVersionMutation();

  const onSubmit = async (data: VehiculeVersionPayload) => {
    try {
      setError(null);
      if (isEdit && entity) {
        await updateVehicule({
          idversion: entity.idversion,
          data,
        }).unwrap();
      } else {
        await createVehicule(data).unwrap();
      }

      if (window.opener) {
        window.opener.postMessage(
          { [isEdit ? 'updated' : 'created']: true },
          window.location.origin
        );
        window.close();
      }
    } catch (err: any) {
      const apiError = err as { data?: { errors?: string[]; message?: string } };
      if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
        setError(apiError.data.errors.join(', '));
      } else {
        setError(apiError.data?.message || 'Error al guardar el vehiculo');
      }
    }
  };

  return (
    <div className="p-1 md:p-0 w-full h-full md:w-[90%] md:h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
        {isView ? 'Ver Vehículo' : isEdit ? 'Editar Vehículo' : 'Crear Vehículo'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        {/* Compañías primero para filtrar marcas/modelos */}
        <Controller
          name="companyIds"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Compañías
              </label>
              <MultiSelect
                options={companyOptions}
                value={field.value as string[]}
                onChange={(value) => {
                  field.onChange(value);
                  setValue('brandId', undefined as any);
                  setValue('modelId', undefined as any);
                }}
                placeholder="Seleccionar compañías..."
                disabled={isView}
              />
              {errors.companyIds && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.companyIds.message)}
                </p>
              )}
            </div>
          )}
        />

        {isView && entity ? (
          // Vista: mostrar marca / línea / modelo en línea, sin inputs
          <div className="bg-white p-4 rounded border">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Detalle de vehículo
            </h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-medium">Marca: </span>
                <span>{entity.marca.descrip}</span>
              </div>
              <div>
                <span className="font-medium">Línea: </span>
                <span>{entity.modelo.linea?.descrip || 'Sin línea'}</span>
              </div>
              <div>
                <span className="font-medium">Modelo: </span>
                <span>{entity.modelo.descrip}</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Marca / Modelo existentes en la misma fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marca existente */}
              <div className="space-y-2">
                <Controller
                  name="brandId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Marca existente
                      </label>
                      <SelectSearch
                        value={field.value ? String(field.value) : undefined}
                        onChange={(val) => {
                          const num = val ? Number(val) : undefined;
                          field.onChange(num);
                          if (num) {
                            setValue('newBrandDescrip', '');
                            setValue('modelId', undefined as any);
                            setValue('newModelDescrip', '');
                            setValue('newLineDescrip', '');
                          }
                        }}
                        loadOptions={loadBrands}
                        placeholder={loadingBrand ? 'Cargando...' : 'Seleccionar marca'}
                        disabled={isView}
                      />
                      {errors.brandId && (
                        <p className="text-red-500 text-xs mt-1">
                          {String(errors.brandId.message)}
                        </p>
                      )}
                    </div>
                  )}
                />

                {!isEdit && (
                  <CustomInput
                    label="Nueva marca (opcional)"
                    {...register('newBrandDescrip', {
                      onChange: (e) => {
                        const val = e.target.value;
                        setValue('newBrandDescrip', val);
                        if (val) {
                          setValue('brandId', undefined as any);
                        }
                      },
                    })}
                    error={errors.newBrandDescrip?.toString()}
                    inputClassName="!border-yellow-light bg-yellow-light"
                    labelClassName="!text-black"
                    placeholder="Completar solo si no seleccionas marca"
                    disabled={isView}
                  />
                )}
              </div>

              {/* Modelo existente */}
              <div className="space-y-2">
                <Controller
                  name="modelId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Modelo existente
                      </label>
                      <SelectSearch
                        value={field.value ? String(field.value) : undefined}
                        onChange={(val) => {
                          const num = val ? Number(val) : undefined;
                          field.onChange(num);
                          if (num) {
                            setValue('newModelDescrip', '');
                            setValue('newLineDescrip', '');
                          }
                        }}
                        loadOptions={loadModels}
                        placeholder={
                          !brandId
                            ? 'Primero seleccioná una marca'
                            : loadingModel
                            ? 'Cargando...'
                            : 'Seleccionar modelo'
                        }
                        disabled={isView || !brandId}
                      />
                      {!brandId && !isView && (
                        <p className="text-xs text-gray mt-1">
                          Para ver modelos existentes, seleccioná una marca primero.
                        </p>
                      )}
                      {errors.modelId && (
                        <p className="text-red-500 text-xs mt-1">
                          {String(errors.modelId.message)}
                        </p>
                      )}
                    </div>
                  )}
                />

                {!isEdit && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInput
                      label="Nuevo modelo (opcional)"
                      {...register('newModelDescrip', {
                        onChange: (e) => {
                          const val = e.target.value;
                          setValue('newModelDescrip', val);
                          if (val) {
                            setValue('modelId', undefined as any);
                          }
                        },
                      })}
                      error={errors.newModelDescrip?.toString()}
                      inputClassName="!border-yellow-light bg-yellow-light"
                      labelClassName="!text-black"
                      placeholder="Completar solo si no seleccionas modelo"
                      disabled={isView}
                    />

                    <CustomInput
                      label="Nueva línea (opcional)"
                      {...register('newLineDescrip')}
                      error={errors.newLineDescrip?.toString()}
                      inputClassName="!border-yellow-light bg-yellow-light"
                      labelClassName="!text-black"
                      placeholder="Línea para el nuevo modelo"
                      disabled={isView}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      <CustomInput
        label="Descripción corta"
        {...register('nueva_descrip')}
        error={errors.nueva_descrip?.message}
        inputClassName="!border-yellow-light bg-yellow-light"
        labelClassName="!text-black"
        placeholder="Ej: Corolla XEi"
        disabled={isView}
      />
        <CustomInput
          label="Descripción"
          {...register('descrip')}
          error={errors.descrip?.message}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
          placeholder="Ej: Corolla 2.0 XEi CVT"
          disabled={isView}
        />


        <CustomInput
          label="Código interno"
          {...register('codigo')}
          error={errors.codigo?.message}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
          placeholder="Ej: COR2XEI"
          disabled={isView}
        />

        {error && (
          <div className="mt-2 rounded bg-red-100 border border-red-300 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
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
            <CustomButton type="submit" disabled={isCreating || isUpdating}>
              {isEdit ? 'Actualizar' : 'Crear'}
            </CustomButton>
          </div>
        )}
      </form>
    </div>
  );
}

