/* eslint-disable @typescript-eslint/no-explicit-any */
// app/administradores/create/components/AdminForm.tsx
'use client';
import { useForm, Controller } from 'react-hook-form';  
import { CustomInput } from '@/app/components/ui/customInput';
import { 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useGetUserByIdQuery 
} from '@/app/api/userApi';
import { useGetAllCompaniesQuery } from '@/app/api/companyApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';  
import { 
  CreateAdminInput, 
  UpdateAdminInput, 
  createAdminSchema, 
  updateAdminSchema,
  UserWithCompanies
} from '@/app/types/user';
import CustomButton from '@/app/components/ui/customButton';
import { Role } from '@/app/types'; 
import { MultiSelect } from '@/app/components/ui/multiSelect'; 

interface AdminFormProps {
  entity?: UserWithCompanies; // ✅ Cambiar de adminId a entity
  readOnly?: boolean; 
}

export default function AdminForm({ entity, readOnly = false }: AdminFormProps) {
  const isEdit = Boolean(entity) && !readOnly;
  const isView = Boolean(entity) && readOnly;
   
  // Si tenemos entity, ya vienen los datos del CrudPageFactory
  const { data: fetchedAdmin } = useGetUserByIdQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    { id: entity?.id! }, 
    { skip: !entity?.id || Boolean(entity.companies) } // Skip si ya tenemos los datos completos
  ); 
  const adminData = entity?.companies ? entity : fetchedAdmin;
  
  // Obtener todas las compañías para el selector
  const { data: companiesData } = useGetAllCompaniesQuery({
    page: 1,
    limit: 1000,
  });

  const { 
    register, 
    handleSubmit,  
    control,
    reset, // ✅ Agregar reset
    formState: { errors } 
  } = useForm<CreateAdminInput | UpdateAdminInput>({
    resolver: zodResolver(isEdit || isView ? updateAdminSchema : createAdminSchema),
    defaultValues: {
      companyIds: [],
    }
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [error, setError] = useState<string | null>(null);

  // ✅ Cargar datos del admin al editar o ver
 useEffect(() => {
  if (adminData && companiesData?.data) {
    const assignedCompanies = adminData.companies?.map(({company:c}) => c?.id) || [];

    reset({
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      companyIds: assignedCompanies,
      password: '',
    });
  }
}, [adminData, companiesData, reset]);


  const onSubmit = async (data: CreateAdminInput | UpdateAdminInput) => {
    try {
      const payload = {
        ...data,
        role: Role.ADMIN, 
        companyIds: Array.isArray(data.companyIds)
        ? data.companyIds.map((c: any) => (typeof c === "string" ? c : c.value))
        : [], // aseguramos que sea array de strings
      ...(isEdit && !data.password && { password: undefined }),
        ...(isEdit && !data.password && { password: undefined }),
      };

      if (isEdit && entity?.id) {
        await updateUser({
          data: payload,
          id: entity.id
        }).unwrap();
      } else { 
        await createUser(payload as CreateAdminInput).unwrap();
      }
      console.log(payload)
      // Notificar a la ventana padre y cerrar
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
        // Si viene un array de errores, unirlos
        setError(apiError.data.errors.join(", "));
      } else { 
        setError(err?.data?.message || "Error al guardar el administrador");
      }
    }
  };

  // Preparar opciones para el MultiSelect
  const companyOptions = companiesData?.data.map(c => ({
    value: c.id,
    label: c.name
  })) || [];

  // Obtener nombres de compañías seleccionadas para vista
  const selectedCompanyNames = adminData?.companies?.map(c => c.company?.name) || [];

  // ✅ Mostrar loading solo si estamos esperando datos
  if (!adminData && entity?.id) {
    return (
      <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth flex items-center justify-center">
        <p className="text-gray">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="w-[90%] h-[90%] border rounded shadow bg-blue-light-ligth overflow-y-auto">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
        {isView ? 'Ver Administrador' : isEdit ? 'Editar Administrador' : 'Crear Administrador'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label="Nombre"
            {...register('firstName')}
            error={errors.firstName?.message}
            inputClassName="!border-yellow-light bg-yellow-light"
            labelClassName="!text-black"
            placeholder="Ej: Juan"
            disabled={isView}
          />

          <CustomInput
            label="Apellido"
            {...register('lastName')}
            error={errors.lastName?.message}
            inputClassName="!border-yellow-light bg-yellow-light"
            labelClassName="!text-black"
            placeholder="Ej: Pérez"
            disabled={isView}
          />
        </div>

        <CustomInput
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
          placeholder="admin@ejemplo.com"
          disabled={isView}
        />

        {!isView && (
          <CustomInput
            label={isEdit ? "Contraseña (dejar vacío para mantener la actual)" : "Contraseña"}
            type="password"
            {...register('password')}
            error={errors.password?.message}
            inputClassName="!border-yellow-light bg-yellow-light"
            labelClassName="!text-black"
            placeholder="••••••••"
          />
        )}

        {/* Selector de compañías */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Compañías asignadas {!isView && '(opcional)'}
          </label>
          
          {isView ? (
            // Vista simple: solo texto
            <div className="border border-gray/50 px-3 py-2 rounded bg-gray/5 min-h-[42px]">
              {selectedCompanyNames.length === 0 ? (
                <span className="text-gray/60">Sin compañías asignadas</span>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {selectedCompanyNames.map((name, idx) => (
                    <li key={idx} className="text-sm">
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            // Modo edición/creación: MultiSelect
            <Controller
              name="companyIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={companyOptions}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Seleccionar compañías..."
                />
              )}
            />
          )}
          
          {errors.companyIds?.message && (
            <span className="text-red-500 text-sm">
              {errors.companyIds.message}
            </span>
          )}
        </div>

        {/* Información adicional en modo vista */}
        {isView && adminData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray/5 rounded">
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Fecha de creación
              </label>
              <p className="text-sm">
                {new Date(adminData.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Última actualización
              </label>
              <p className="text-sm">
                {new Date(adminData.updatedAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray mb-1">
                Rol
              </label>
              <p className="text-sm font-medium">
                {adminData.role === Role.ADMIN ? 'Administrador' : 'Usuario'}
              </p>
            </div>
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