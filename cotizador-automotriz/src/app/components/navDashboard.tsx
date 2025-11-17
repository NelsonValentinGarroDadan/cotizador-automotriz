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
    <section className="h-full min-h-[90vh] flex flex-col items-start justify-between py-5 sticky top-0 left-0">
      <div className="flex flex-col items-start w-full">
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
                className="text-blue! text-left! text-xl hover:bg-blue-light-ligth! w-full px-5 py-3 bg-transparent!"
              />
            );
          }
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`text-blue text-xl hover:bg-blue-light-ligth w-full px-5 py-3 ${
                isActive ? "bg-blue-light-ligth  border-r-3 border-blue" : ""
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <CustomButton
        type="button"
        onClick={handleLogout}
        className="text-xl text-blue! bg-transparent! text-left hover:bg-blue-light-ligth!  w-full px-5 py-3"
      >
        Cerrar sesión
      </CustomButton>
    </section>
  );
}
