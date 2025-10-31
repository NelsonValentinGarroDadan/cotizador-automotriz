"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Role } from "../types";

export default function Page() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    useEffect(() => {
        if (!isAuthenticated || !user){ 
            router.push("/");
            return;
        };
        setTimeout(()=>{
            if(user?.role == Role.ADMIN){
                router.push("/dashboard/admin");
            }else{
                router.push("/dashboard/user");
            }
        },500)
    }, [user,isAuthenticated, router]);
  return (
    <section className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div> 
      </div>
    </section>
  );
}
