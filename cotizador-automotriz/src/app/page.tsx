 "use client";
import { Check } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { CustomInput } from "./components/ui/customInput";
import { LoginDto } from "./types/user";
import { useEffect, useState } from "react";
import { useLoginMutation } from "./api/authApi";
import { useAuthStore } from "./store/useAuthStore"; 
import { useRouter } from "next/navigation";

export default function Home() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>();
  const [error, setError] = useState<string | null>(null);
  
  const checksCharacteristics = [
    {title: "100% on-line", des: "Disfrute las ventajas de contar con un sistema en la nube, no mas fastos de infrastructura."},
    {title: "Modalidad SaaS", des: "Una nueva generación de soluciones para el mercado de la movilidad. Alta disponibilidad. Maxima integración."},
    {title: "Servicios que ponen al cliente en el centro", des: "Mejorando la experiencia de usuario para obtener mayores beneficios y aumentar su productividad."},
  ];
  
  const containerClassName = "w-[60%]";
  const labelClassName = "text-sm";
  const inputClassName = "text-sm p-4";

  const { setAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [submittLogin, { isLoading, error:errorRequest }] = useLoginMutation();

  const onSubmit = async (data: LoginDto) => {
    setError(null);
    try {
      const res = await submittLogin(data).unwrap();
      setAuth(res.user, res.token);
      router.push('/dashboard')
    } catch (e) {
      console.log(e)
      // Tipar el error correctamente
      const apiError = errorRequest  as { data:{ error: string[]} }; 
      if (apiError.data?.error && Array.isArray(apiError.data.error)) {
        // Si viene un array de errores, unirlos
        setError(apiError.data.error.join(", "));
      } else {
        setError("Error al iniciar sesión");
      }
    }
  };
  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  return (
    <section className="min-h-[70vh] flex-row! container">
      <div className="w-full h-[70vh] flex-col items-center justify-start hidden md:flex">
        <Image
          src="/imgs/logo_dms.jpeg"
          alt="Logo CMDS"
          width={1000}
          height={1000}
          className="w-50 h-10 object-contain mb-5"
        />
        <h1 className="text-2xl font-extrabold w-[60%]">
          Sistema Integral <br /> para Concesionarios
        </h1>
        {checksCharacteristics.map((check) => (
          <div key={check.title} className="flex items-start justify-center w-[60%] mt-1 p-4 gap-5">
            <Check className="h-8 w-8 text-blue" />
            <div className="w-full flex flex-col items-start justify-start gap-3">
              <h2 className="text-sm text-black">{check.title}</h2>
              <p className="text-gray text-sm">{check.des}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full h-[70vh] flex flex-col items-center justify-center gap-5 px-5">
        <CustomInput
          label="Email"
          type="text"
          placeholder="Ingrese su email"
          {...register('email', { required: 'Campo requerido' })}
          error={errors.email?.message}
          containerClassName={containerClassName}
          labelClassName={labelClassName}
          inputClassName={inputClassName}
        />

        <CustomInput
          label="Contraseña"
          type="password"
          placeholder="Ingrese su contraseña"
          {...register('password', { required: 'Campo requerido' })}
          error={errors.password?.message}
          containerClassName={containerClassName}
          labelClassName={labelClassName}
          inputClassName={inputClassName}
        />

        {error && (
          <span className="text-red-500 text-sm w-[60%]">{error}</span>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-[60%] bg-blue text-center text-white rounded-md py-3 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}