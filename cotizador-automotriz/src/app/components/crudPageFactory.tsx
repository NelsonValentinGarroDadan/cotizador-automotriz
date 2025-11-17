'use client';

import { ReduxProvider } from '@/app/store/provider';
import { useAuthRedirect } from '@/app/hooks/useAuthRedirect';
import CustomButton from '@/app/components/ui/customButton';
import { Role } from '../types';

interface Column<T> {
  key: keyof T;
  label: string;
  value?: string | number;
}

interface CrudPageFactoryProps<T> {
  action: 'create' | 'edit' | 'view' | 'delete';
  formComponent?: React.ComponentType<{ entity?: T; readOnly?: boolean;}>;
  entity?: T;
  isLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  deleteMutation?: () => Promise<void>;
  columns?: Column<T>[];
  allowedRoles?: Role[];
  entityName: string; 
}

export function CrudPageFactory<T>({
  action,
  formComponent: Form,
  entity,
  isLoading,
  error,
  deleteMutation,
  columns,
  allowedRoles = [Role.ADMIN, Role.SUPER_ADMIN],
  entityName, 
}: CrudPageFactoryProps<T>) {
  useAuthRedirect(allowedRoles);
  
  // --- Loading y error ---
  if (action !== 'create' && isLoading)
    return (
      <section className="flex h-screen w-screen items-center justify-center">
        <p className="text-white">Cargando {entityName.toLowerCase()}...</p>
      </section>
    );

  if (action !== 'create' && (error || !entity))
    return (
      <section className="flex h-screen w-screen items-center justify-center">
        <p className="text-red-500">Error al cargar {entityName.toLowerCase()}.</p>
      </section>
    );

  // --- Delete page ---
  if (action === 'delete') {
    const handleCancel = () => window.close();
    const handleConfirm = async () => {
      if (!deleteMutation) return;
      await deleteMutation();
      if (window.opener)
        window.opener.postMessage({ deleted: true }, window.location.origin);
      window.close();
    };

    return (
      <ReduxProvider>
        <section className="flex flex-col items-center justify-center h-screen w-screen bg-blue-light-ligth">
          <div className="w-[90%] max-w-2xl border rounded shadow bg-white p-4">
            <h1 className="text-xl font-bold mb-6 text-black text-center">
              ¿Seguro que querés eliminar este {entityName.toLowerCase()}?
            </h1>

            <table className="w-full border-collapse text-sm">
              <thead className="bg-blue text-white">
                <tr>
                  {columns?.map((col) => (
                    <th
                      key={String(col.key)}
                      className="py-2 px-3 text-left border-l border border-blue-light-ligth"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {columns?.map((col) => (
                    <td
                      key={String(col.key)}
                      className="py-2 px-3 border-b border border-blue-light-ligth"
                    >
                      {col.value ? col.value  : String(entity?.[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div className="flex justify-center gap-4 mt-8">
              <CustomButton onClick={handleCancel}>Cancelar</CustomButton>
              <CustomButton
                onClick={handleConfirm}
                className="bg-red/80 hover:bg-red"
              >
                Confirmar
              </CustomButton>
            </div>
          </div>
        </section>
      </ReduxProvider>
    );
  }

  // --- Create / Edit / View ---
  return (
    <ReduxProvider>
      <section className="h-screen w-screen flex items-center justify-center">
        {Form ? <Form entity={entity} readOnly={action === 'view'} /> : null}
      </section>
    </ReduxProvider>
  );
}
