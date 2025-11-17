'use client';

import { Suspense } from 'react';
import { CrudPageFactory } from '@/app/components/crudPageFactory';
import UserForm from '../components/adminForm';
import { User } from '@/app/types/user';

export default function CreateCompanyPage() {
  return (
    <Suspense fallback={null}>
      <CrudPageFactory<User>
        action="create"
        formComponent={UserForm}
        entityName="Administrador"
      />
    </Suspense>
  );
}
