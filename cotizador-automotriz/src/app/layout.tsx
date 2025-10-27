import type { Metadata } from "next"; 
import "./globals.css"; 
import Header from "./components/header";

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
        <Header />
        {children}
      </body>
    </html>
  );
}
