'use client';

import { useAuthRedirect } from '@/app/hooks/useAuthRedirect';
import { ReduxProvider } from '../store/provider';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthRedirect();
  return(
    <ReduxProvider> 
      {children} 
    </ReduxProvider>
  );
}
