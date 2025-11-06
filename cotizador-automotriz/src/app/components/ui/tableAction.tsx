'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react'; 
import WindowFormButton from '../windowFormButton';

interface TableActionsProps {
  baseUrl: string; // ejemplo: '/dashboard/admin/companies'
  id: string | number;
  onActionComplete?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  className?: string;
}

export default function TableActions({
  baseUrl,
  id,
  onActionComplete,
  showView = true,
  showEdit = true,
  showDelete = true,
  className = '',
}: TableActionsProps) {
  // construimos las rutas automáticas
  const viewUrl = `${baseUrl}/${id}/view`;
  const editUrl = `${baseUrl}/${id}/edit`;
  const deleteUrl = `${baseUrl}/${id}/delete`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showView && (
        <WindowFormButton
          formUrl={viewUrl}
          onCreated={onActionComplete}
          buttonText={
            <Eye
              className="w-5 h-5 text-blue-500 cursor-pointer hover:scale-110 transition"
              />
            }
          title="Ver detalles"
          className="bg-transparent p-2 hover:bg-gray-100 rounded"
        />
      )}

      {showEdit && (
        <WindowFormButton
          formUrl={editUrl}
          onCreated={onActionComplete}
          buttonText={
            <Pencil
              className="w-5 h-5 text-yellow-500 cursor-pointer hover:scale-110 transition"
              />
            }
          title="Editar"
          className="bg-transparent p-2 hover:bg-gray-100 rounded"
        />
      )}

      {showDelete && (
        <WindowFormButton
          formUrl={deleteUrl}
          onCreated={onActionComplete}
          buttonText={
            <Trash2
              className="w-5 h-5 text-red-600 cursor-pointer hover:scale-110 transition"
              />
            }
          title="Eliminar"
          className="bg-transparent p-2 hover:bg-gray-100 rounded"
        />
      )}
    </div>
  );
}
