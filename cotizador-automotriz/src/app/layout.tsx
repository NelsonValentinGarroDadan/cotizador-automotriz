import type { Metadata } from "next"; 
import "./globals.css";  
import { ReduxProvider } from "./store/provider";

export const metadata: Metadata = {
  title: "Simulador de Créditos Automotrices", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
      <ReduxProvider> 
        {children} 
      </ReduxProvider>
      </body>
    </html>
  );
}
