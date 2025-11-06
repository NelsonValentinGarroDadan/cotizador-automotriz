import { ReduxProvider } from '../store/provider';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) { 
  return(
    <ReduxProvider> 
      {children} 
    </ReduxProvider>
  );
}
