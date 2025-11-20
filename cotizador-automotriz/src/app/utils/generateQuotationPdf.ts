// app/utils/generateQuotationPdf.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Company } from "../types/compay";
import { User } from "../types/user";

(pdfMake as any).vfs = pdfFonts.vfs;

export async function urlToBase64(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.warn("[PDF] Imagen no encontrada:", url);
      return undefined;
    }

    const blob = await res.blob();

    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.warn("[PDF] No se pudo obtener contexto del canvas");
            resolve(undefined);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const pngBase64 = canvas.toDataURL("image/png");
          resolve(pngBase64.startsWith("data:image/png") ? pngBase64 : undefined);
        } catch (err) {
          console.error("[PDF] Error en conversion canvas:", err);
          resolve(undefined);
        }
      };

      img.onerror = () => {
        console.error("[PDF] Error cargando imagen");
        resolve(undefined);
      };

      const objectURL = URL.createObjectURL(blob);
      img.src = objectURL;
    });
  } catch (err) {
    console.error("[PDF] Error convirtiendo imagen:", err);
    return undefined;
  }
}

interface GenerateQuotationPdfInput {
  company: Company;
  user: User;
  quotation: any;
  coefficients: any[];
  companyLogoBase64?: string;
  planLogoBase64?: string;
}

export function generateQuotationPdfDoc({
  company,
  user,
  quotation,
  coefficients,
  companyLogoBase64,
  planLogoBase64,
}: GenerateQuotationPdfInput) {
  const cotizacionDate = new Date(quotation.createdAt).toLocaleDateString("es-AR");
  const today = new Date().toLocaleDateString("es-AR");

  const tnaBlocks = coefficients.map((c: any) => {
    const tnaMostrar = Math.ceil(Number(c.tna));
    const coef = Number(c.coeficiente);
    const cuota = Number(quotation.totalValue) * (coef / 10000);

    const factorQuebranto = 1.21;
    const quebrantoP = Number(c.quebrantoFinanciero || 0) / 100;
    const quebranto = Math.ceil(Number(quotation.totalValue) * quebrantoP * factorQuebranto);

    const cuotaBalon = Number(c.cuotaBalon || 0);
    const mesesBalon = c.cuotaBalonMonths?.map((x: any) => x.month) || [];

    const contenido: any[] = [
      { text: `TNA ${tnaMostrar}%`, fontSize: 9, color: "#444" },
      {
        text: `$${Math.ceil(cuota).toLocaleString("es-AR")}`,
        bold: true,
        fontSize: 11,
        color: "#0a6b1a",
        margin: [0, 2],
      },
    ];

    if (quebranto > 0) {
      contenido.push({
        text: `Quebranto: $${quebranto.toLocaleString("es-AR")}`,
        fontSize: 8,
        color: "#555",
      });
    }

    if (cuotaBalon > 0) {
      contenido.push({
        text: `Cuota Balon: $${cuotaBalon.toLocaleString("es-AR")} meses: ${mesesBalon.join(", ")}`,
        fontSize: 8,
        color: "#b38300",
      });
    }

    return { stack: contenido, alignment: "center" };
  });

  const vehicleLabel =
    quotation.vehicleVersion
      ? `${quotation.vehicleVersion.marca?.descrip ?? ""} ${quotation.vehicleVersion.modelo?.descrip ?? ""} ${quotation.vehicleVersion.nueva_descrip || quotation.vehicleVersion.descrip}`.trim() ||
        "N/D"
      : "N/D";

  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 30, 40, 30],

    content: [
      {
        table: {
          widths: ["60%", "40%"],
          body: [
            [
              {
                stack: [
                  { text: company.name, style: "headerTitle" },
                  { text: `Fecha de Cotizacion: ${cotizacionDate}`, color: "white" },
                  { text: `Fecha Actual: ${today}`, color: "white" },
                  { text: `Atendido por: ${user.firstName} ${user.lastName}`, color: "white" },
                ],
                margin: [10, 10, 0, 10],
              },
              {
                alignment: "right",
                margin: [0, 5, 10, 5],
                stack: [
                  ...(companyLogoBase64 ? [{ image: companyLogoBase64, width: 130 }] : []),
                ],
              },
            ],
          ],
        },
        layout: {
          fillColor: () => "#7d8385",
          hLineWidth: () => 0,
          vLineWidth: () => 0,
        },
      },

      {
        canvas: [{ type: "line", x1: 0, y1: 15, x2: 515, y2: 15, lineWidth: 1 }],
        margin: [0, 10, 0, 20],
      },

      {
        text: "Datos del Cliente",
        style: "sectionTitle",
      },

      {
        table: {
          widths: ["30%", "70%"],
          body: [
            ["Nombre", quotation.clientName],
            ["DNI", quotation.clientDni],
            ["Vehiculo", vehicleLabel],
            ["Monto Total", `$${Number(quotation.totalValue).toLocaleString("es-AR")}`],
          ],
        },
        layout: "noBorders",
        fontSize: 11,
        margin: [0, 5, 0, 25],
      },

      {
        table: {
          widths: ["70%", "30%"],
          body: [
            [
              {
                text: quotation.planVersion.plan.name,
                style: "planName",
                color: "white",
                margin: [10, 10, 0, 10],
              },
              {
                alignment: "right",
                margin: [0, 5, 10, 5],
                stack: [
                  ...(planLogoBase64 ? [{ image: planLogoBase64, width: 110 }] : []),
                ],
              },
            ],
          ],
        },
        layout: {
          fillColor: () => "#7d8385",
          hLineWidth: () => 0,
          vLineWidth: () => 0,
        },
      },

      {
        text: "Resumen de Cuotas",
        style: "sectionTitle",
        margin: [0, 20, 0, 10],
      },

      {
        columns: tnaBlocks,
        columnGap: 10,
      },
    ],

    styles: {
      headerTitle: {
        fontSize: 16,
        bold: true,
        color: "white",
      },
      sectionTitle: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 8],
      },
      planName: {
        fontSize: 14,
        bold: true,
      },
    },
  };

  return docDefinition;
}

