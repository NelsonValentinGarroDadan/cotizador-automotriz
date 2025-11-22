"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import WindowFormButton from "./windowFormButton";
import { useAuthStore } from "../store/useAuthStore";
import CustomButton from "./ui/customButton";
import { Menu, X } from "lucide-react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const renderLink = useMemo(
    () =>
      navsLinks.map((link) => {
        const isActive = pathname === link.href;
        const baseClass =
          "text-white text-xl hover:bg-white/40 px-1 py-3 transition-all";
        if (link.action) {
          return (
            <WindowFormButton
              key={link.label}
              formUrl={link.urlAction!}
              buttonText={<span>{link.action}</span>}
              title="Ver detalles"
              width={link.widtgAction}
              className={`text-white text-left text-xl hover:bg-white/40 px-3 py-3`}
            />
          );
        }
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`${baseClass} ${
              isActive ? "bg-white/40 border-b-3 border-white/50" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      }),
    [navsLinks, pathname]
  );

  return (
    <section className="px-5 pt-2 sticky top-0 left-0 z-1000 bg-blue w-full">
      <div className="flex items-center justify-end md:justify-between w-full">
        <div className="flex items-center py-5 md:py-0">
          <button
            className="md:hidden text-white"
            aria-label="Abrir menú"
            onClick={() => setIsMenuOpen(true)}
            type="button"
          >
            <Menu size={28} />
          </button>
          <div className="hidden md:flex items-center justify-start gap-1">
            {renderLink}
          </div>
        </div>
        <div className="hidden md:flex">
          <CustomButton
            type="button"
            onClick={handleLogout}
            className="text-xl text-white bg-transparent hover:bg-white/40 px-5 md:w-44 py-3"
          >
            Cerrar sesión
          </CustomButton>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-1500 bg-blue text-white flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/30">
            <span className="text-xl font-semibold">Menú</span>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="text-white"
              aria-label="Cerrar menú"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-5 py-6 overflow-y-auto">
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
                    className="text-white text-left text-2xl w-full px-4 py-3 border-b border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  />
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-2xl font-semibold px-3 py-3 ${
                    isActive ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <CustomButton
              type="button"
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-xl text-white bg-transparent border border-white/40 mt-auto px-4 py-3"
            >
              Cerrar sesión
            </CustomButton>
          </div>
        </div>
      )}
    </section>
  );
}
