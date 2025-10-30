import type { Metadata } from "next"; 
import "./globals.css"; 
import Header from "./components/header";  
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
      <body className="pt-34">
      <ReduxProvider>
        <Header />
        {children} 
      </ReduxProvider>
      </body>
    </html>
  );
}
