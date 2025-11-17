// app/HC/[id]/pdf/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useGetQuotationByIdQuery } from "@/app/api/quotationApi";
import { generateQuotationPdfDoc, urlToBase64 } from "@/app/utils/generateQuotationPdf";
import pdfMake from "pdfmake/build/pdfmake";
import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";
import { Role } from "@/app/types";

export default function PdfQuotationPage() {
  useAuthRedirect([Role.ADMIN, Role.USER, Role.SUPER_ADMIN]);
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const { data } = useGetQuotationByIdQuery({ id });
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    if (!data) return;

    async function buildPdf() {
      let companyLogo: string | undefined;
      let planLogo: string | undefined;

      // LOGO COMPAÑIA
      if (data!.company.logo) {
        companyLogo = await urlToBase64(
          `${process.env.NEXT_PUBLIC_BASE_URL_IMG}${data!.company.logo}`
        );
      }

      // LOGO PLAN
      if (data!.planVersion.plan.logo) {
        planLogo = await urlToBase64(
          `${process.env.NEXT_PUBLIC_BASE_URL_IMG}${data!.planVersion.plan.logo}`
        );
      }

      const docDefinition = generateQuotationPdfDoc({
        company: data!.company,
        user: data!.user,
        quotation: data,
        coefficients: data!.planVersion.coefficients,
        companyLogoBase64: companyLogo,
        planLogoBase64: planLogo,
      });

      pdfMake.createPdf(docDefinition).getBlob((blob) => {
        setPdfUrl(URL.createObjectURL(blob));
      });
    }

    buildPdf();
  }, [data]);


  if (!pdfUrl) return <p>Generando PDF...</p>;

  return (
    <iframe src={pdfUrl} className="w-full h-screen border-none"/>
  );
}
