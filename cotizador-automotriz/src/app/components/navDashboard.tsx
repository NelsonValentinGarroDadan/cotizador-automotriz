"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WindowFormButton from "./windowFormButton";

export type NavItem = {
  label: string;
  href: string;
  action?: string;
  urlAction?:string;
  widtgAction?:number;
};

export default function NavDashboard({ navsLinks }: { navsLinks: NavItem[] }) {
  const pathname = usePathname(); 
  return (
    <section className="h-full flex flex-col items-start justify-start py-5 sticky top-0 left-0">
      {navsLinks.map((link) => {
      const isActive = pathname === link.href;
        if(link.action){
          return(
              <WindowFormButton
                key={link.label}
                formUrl={link.urlAction!} 
                buttonText={
                <span className=""> 
                  {link.action}
                </span>
                }
                title="Ver detalles" 
                width={link.widtgAction}
                className="text-blue! text-left! text-xl hover:bg-blue-light-ligth! w-full px-5 py-3 bg-transparent!"
              />
          )
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
    </section>
  );
}
