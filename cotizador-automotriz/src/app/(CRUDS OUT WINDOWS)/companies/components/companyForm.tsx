'use client';
import { useForm } from 'react-hook-form';  
import { CustomInput } from '@/app/components/ui/customInput';
import { useCreateCompanyMutation, useUpdateCompanyMutation } from '@/app/api/companyApi';  
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';  
import { Company, CreateCompanyInput, createCompanySchema } from '@/app/types/compay';
import CustomButton from '@/app/components/ui/customButton';
 
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_IMG; 

interface CompanyFormProps {
  entity?: Company;
  readOnly?: boolean;
}

export default function CompanyForm({ entity }: CompanyFormProps) {
  const company = entity; 
  const isEdit = Boolean(company);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
  });

  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (company) setValue('name', company.name);
  }, [company, setValue]);

  const onSubmit = async (data: CreateCompanyInput) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      
      // 👇 Agrega el archivo si existe
      if (file) {
        formData.append('logo', file);
      }

      if (isEdit && company) {
        await updateCompany({ id: company.id, data: formData }).unwrap();
      } else {
        await createCompany(formData).unwrap();
      }

      if (window.opener) {
        window.opener.postMessage({ updated: true }, window.location.origin);
        window.close();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      const apiError = err  as { data:{ errors: string[]} }; 
      if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
        // Si viene un array de errores, unirlos
        setError(apiError.data.errors.join(", "));
      } else { 
        setError(err?.data?.message || "Error al guardar el usuario");
      }
    }
  };

  return (
    <div className="p-1 md:p-0 w-full h-full md:w-[90%] md:h-[90%] border rounded shadow bg-blue-light-ligth">
      <h1 className="text-xl font-bold mb-4 text-white bg-gray py-2 px-4">
        {isEdit ? 'Editar Compañía' : 'Crear Compañía'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
        <CustomInput
          label="Nombre de la Compañía"
          {...register('name')}
          error={errors.name?.message}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
        />
        <CustomInput
          label="Logo de la compañía (opcional)"
          type="file"
          id="logo-upload"
          onFileChange={setFile}
          defaultImage={company?.logo ? baseUrl+company?.logo : undefined}
          inputClassName="!border-yellow-light bg-yellow-light"
          labelClassName="!text-black"
        />

        {error && <span className="text-red-500 text-sm w-full text-center">{error}</span>}
        <CustomButton type="submit" disabled={isCreating || isUpdating}>
          {isEdit ? (isUpdating ? 'Actualizando...' : 'Actualizar') : (isCreating ? 'Creando...' : 'Crear')}
        </CustomButton>
      </form>
    </div>
  );
}
