'use client';

import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  buttons?: ReactNode; // Aquí podes pasar uno o varios botones
  className?: string; // opcional para estilos extra
}

export default function PageHeader({
  title,
  description,
  buttons,
  className = '',
}:PageHeaderProps) {
  return (
    <div className={`py-2 flex flex-col md:flex-row md:items-center justify-between   ${className}`}>
      <div className="mb-3 md:mb-0">
        <h1 className="text-3xl font-bold text-black">{title}</h1>
        {description && <p className="text-gray text-xl mt-1">{description}</p>}
      </div>
      {buttons && <div className="flex gap-2">{buttons}</div>}
    </div>
  );
};
 