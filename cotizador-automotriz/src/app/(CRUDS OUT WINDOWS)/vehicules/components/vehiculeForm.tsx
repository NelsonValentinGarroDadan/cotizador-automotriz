/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CustomButton from '@/app/components/ui/customButton';
import { CustomInput } from '@/app/components/ui/customInput';
import { MultiSelect } from '@/app/components/ui/multiSelect';
import { SelectSearch, SelectSearchOption } from '@/app/components/ui/selectSearch';
import {  useCreateVehiculeVersionMutation, useUpdateVehiculeVersionMutation } from '@/app/api/vehiculeApi';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { useAuthStore } from '@/app/store/useAuthStore';
import { VehiculeVersion, VehiculeVersionPayload } from '@/app/types/vehiculos';

interface VehiculeFormProps {
  entity?: VehiculeVersion;
  readOnly?: boolean;
}

export default function VehiculeForm({ entity, readOnly = false }: VehiculeFormProps) {
  const isEdit = Boolean(entity) && !readOnly;
  const isView = Boolean(entity) && readOnly;

  const { token } = useAuthStore();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL_API || 'http://localhost:3003/api';

  const {
    register,
    handleSubmit,
    control,
    reset,
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
  const [loadingLine, setLoadingLine] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);

  useEffect(() => {
    if (entity && companiesData?.data) {
      const assignedCompanies = entity.company?.map((c) => c.id) || [];
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

  const loadBrands = async (search: string): Promise<SelectSearchOption[]> => {
    setLoadingBrand(true);
    try {
      const url = `${apiBaseUrl}/vehicules/brands?limit=50&search=${encodeURIComponent(
        search || ''
      )}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      return (json.data || []).map((b: any) => ({
        value: String(b.idmarca),
        label: b.descrip,
      }));
    } finally {
      setLoadingBrand(false);
    }
  };

  const loadLines = async (search: string, brandId?: number): Promise<SelectSearchOption[]> => {
    if (!brandId) return [];
    setLoadingLine(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '50');
      params.append('brandId', brandId.toString());
      if (search) params.append('search', search);

      const url = `${apiBaseUrl}/vehicules/lines?${params.toString()}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      return (json.data || []).map((l: any) => ({
        value: String(l.idlinea),
        label: l.descrip,
      }));
    } finally {
      setLoadingLine(false);
    }
  };

  const loadModels = async (
    search: string,
    brandId?: number,
    lineId?: number
  ): Promise<SelectSearchOption[]> => {
    if (!brandId || !lineId) return [];
    setLoadingModel(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '50');
      params.append('brandId', brandId.toString());
      params.append('lineId', lineId.toString());
      if (search) params.append('search', search);

      const url = `${apiBaseUrl}/vehicules/models?${params.toString()}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      return (json.data || []).map((m: any) => ({
        value: String(m.idmodelo),
        label: m.descrip,
      }));
    } finally {
      setLoadingModel(false);
    }
  };

  const companyOptions =
    companiesData?.data.map((c) => ({
      value: c.id,
      label: c.name,
    })) || [];

  const [createVehicule, { isLoading: isCreating }] =
    useCreateVehiculeVersionMutation();
  const [updateVehicule, { isLoading: isUpdating }] =
    useUpdateVehiculeVersionMutation();

  const onSubmit = async (data: VehiculeVersionPayload) => {
    const payload: VehiculeVersionPayload = {
      ...data,
      brandId: Number(data.brandId),
      modelId: Number(data.modelId),
      companyIds: data.companyIds,
    };

    if (isEdit && entity) {
      await updateVehicule({
        idversion: entity.idversion,
        data: payload,
      }).unwrap();
    } else {
      await createVehicule(payload).unwrap();
    }

    if (window.opener) {
      window.opener.postMessage(
        { [isEdit ? 'updated' : 'created']: true },
        window.location.origin
      );
      window.close();
    }
  };

  return (
    <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
        {isView ? 'Ver Vehículo' : isEdit ? 'Editar Vehículo' : 'Crear Vehículo'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="brandId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Marca
                </label>
                <SelectSearch
                  value={field.value ? String(field.value) : undefined}
                  onChange={(val) => field.onChange(val ? Number(val) : undefined)}
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

          <Controller
            name="lineId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Línea
                </label>
                <SelectSearch
                  value={field.value ? String(field.value) : undefined}
                  onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                  loadOptions={(search) =>
                    loadLines(search, (control._formValues as any).brandId)
                  }
                  placeholder={loadingLine ? 'Cargando...' : 'Seleccionar línea'}
                  disabled={isView}
                />
                {errors as any /* avoid TS noise */ && null}
              </div>
            )}
          />

          <Controller
            name="modelId"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Modelo
                </label>
                <SelectSearch
                  value={field.value ? String(field.value) : undefined}
                  onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                  loadOptions={(search) =>
                    loadModels(
                      search,
                      (control._formValues as any).brandId,
                      (control._formValues as any).lineId
                    )
                  }
                  placeholder={loadingModel ? 'Cargando...' : 'Seleccionar modelo'}
                  disabled={isView}
                />
                {errors.modelId && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.modelId.message)}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <CustomInput
          label="Descripción (Versión)"
          {...register('descrip')}
          error={errors.descrip?.message}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
          placeholder="Ej: Corolla 2.0 XEi CVT"
          disabled={isView}
        />

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
          label="Código interno"
          {...register('codigo')}
          error={errors.codigo?.message}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
          placeholder="Ej: COR2XEI"
          disabled={isView}
        />

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
                onChange={field.onChange}
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
