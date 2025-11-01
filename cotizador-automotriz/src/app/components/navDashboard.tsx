"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

export default function NavDashboard({ navsLinks }: { navsLinks: NavItem[] }) {
  const pathname = usePathname(); 
  return (
    <section className="h-full  border-r border-gray flex flex-col items-start justify-start py-5 ">
      {navsLinks.map((link) => {
      const isActive = pathname === link.href;
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
    </section>
  );
}
