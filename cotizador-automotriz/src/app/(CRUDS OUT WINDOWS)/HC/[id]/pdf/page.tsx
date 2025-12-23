/* eslint-disable @typescript-eslint/no-explicit-any */
// app/HC/[id]/pdf/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useGetQuotationByIdQuery } from "@/app/api/quotationApi";
import { generateQuotationPdfDoc, urlToBase64 } from "@/app/utils/generateQuotationPdf";
import { useEffect, useRef, useState } from "react";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";
import { Role } from "@/app/types"; 

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(script);
  });

export default function PdfQuotationPage() {
  useAuthRedirect([Role.ADMIN, Role.USER, Role.SUPER_ADMIN]);
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const { data } = useGetQuotationByIdQuery({ id });
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const pdfMakeRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function ensurePdfMake() {
      if (pdfMakeRef.current) return pdfMakeRef.current;

      // Cargar pdfmake y vfs desde CDN para evitar problemas de bundle
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js");

      const pdfMake = (window as any).pdfMake;
      pdfMakeRef.current = pdfMake;
      return pdfMake;
    }

    async function buildPdf() {
      const pdfMake = await ensurePdfMake();
      if (!data || !isMounted || !pdfMake) return;

      let companyLogo: string | undefined;
      let planLogo: string | undefined;

      if (data.company.logo) {
        companyLogo = await urlToBase64(`${data.company.logo}`);
      }

      if (data.planVersion.plan?.logo) {
        planLogo = await urlToBase64(`${data.planVersion.plan.logo}`);
      }
      console.log(data.vehicleVersion);
      const docDefinition = generateQuotationPdfDoc({
        company: data!.company,
        user: data!.user,
        quotation: data,
        coefficients: data.planVersion.coefficients,
        companyLogoBase64: companyLogo,
        planLogoBase64: planLogo,
      });

      pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
        setPdfUrl(URL.createObjectURL(blob));
      });
    }

    buildPdf();
    return () => {
      isMounted = false;
    };
  }, [data]);

  if (!pdfUrl) return <p>Generando PDF...</p>;

  return <iframe src={pdfUrl} className="w-full h-screen border-none" />;
}
