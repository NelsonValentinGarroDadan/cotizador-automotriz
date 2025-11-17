"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "./components/ui/customButton";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
      <h1 className="text-3xl font-extrabold mb-4 text-blue">
        Página no encontrada
      </h1>
      <p className="text-gray text-base max-w-md mb-6">
        La página que estás buscando no existe o fue movida.
        Serás redirigido al inicio en 5 segundos.
      </p>
      <CustomButton
        type="button"
        onClick={handleGoHome}
        className="w-full max-w-xs"
      >
        Volver al inicio ahora
      </CustomButton>
    </section>
  );
}

