"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import WindowFormButton from "./windowFormButton";
import { useAuthStore } from "../store/useAuthStore";
import CustomButton from "./ui/customButton";

export type NavItem = {
  label: string;
  href: string;
  action?: string;
  urlAction?: string;
  widtgAction?: number;
};

export default function NavDashboard({ navsLinks }: { navsLinks: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  }; 
  return (
    <section className=" px-5 pt-2 sticky top-0 left-0 z-1000 bg-blue w-full">
      <div className="flex  items-start w-full">
        {navsLinks.map((link) => {
          const isActive = pathname === link.href;
          if (link.action) {
            return (
              <WindowFormButton
                key={link.label}
                formUrl={link.urlAction!}
                buttonText={<span>{link.action}</span>}
                title="Ver detalles"
                width={link.widtgAction}
                className="text-white!  text-left! text-xl hover:bg-white/40!  px-3 py-3  "
              />
            );
          }
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`text-white text-xl hover:bg-white/40   px-3 py-3 ${
                isActive ? "bg-white/40  border-b-3 border-white/50" : ""
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <CustomButton
          type="button"
          onClick={handleLogout}
          className="text-xl text-white! bg-transparent! text-left hover:bg-white/40!  px-5 py-3 ml-10"
        >
          Cerrar sesión
        </CustomButton>
      </div>

    </section>
  );
}
