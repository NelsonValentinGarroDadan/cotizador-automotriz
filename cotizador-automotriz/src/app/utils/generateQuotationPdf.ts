// app/utils/generateQuotationPdf.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Company } from "../types/compay";
import { User } from "../types/user";

(pdfMake as any).vfs = pdfFonts.vfs;

// =========================
// Convertir WebP a PNG/JPEG compatible con pdfMake
// =========================
export async function urlToBase64(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.warn("[PDF] Imagen no encontrada:", url);
      return undefined;
    }

    const blob = await res.blob();

    // ✅ Convertir WebP a PNG usando canvas
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        try {
          // Crear canvas
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.warn("[PDF] No se pudo obtener contexto del canvas");
            resolve(undefined);
            return;
          }

          // Dibujar imagen en canvas
          ctx.drawImage(img, 0, 0);
          
          // Convertir a PNG base64
          const pngBase64 = canvas.toDataURL("image/png");
          
          if (pngBase64.startsWith("data:image/png")) {
            resolve(pngBase64);
          } else {
            console.warn("[PDF] Conversión a PNG falló");
            resolve(undefined);
          }
        } catch (err) {
          console.error("[PDF] Error en conversión canvas:", err);
          resolve(undefined);
        }
      };

      img.onerror = () => {
        console.error("[PDF] Error cargando imagen");
        resolve(undefined);
      };

      // Crear URL del blob y cargar en imagen
      const objectURL = URL.createObjectURL(blob);
      img.src = objectURL;
      
      // Limpiar después de cargar
      img.onload = () => {
        URL.revokeObjectURL(objectURL);
        
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(undefined);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const pngBase64 = canvas.toDataURL("image/png");
          resolve(pngBase64.startsWith("data:image/png") ? pngBase64 : undefined);
        } catch (err) {
          console.error("[PDF] Error en canvas:", err);
          resolve(undefined);
        }
      };
    });
  } catch (err) {
    console.error("[PDF] Error convirtiendo imagen:", err);
    return undefined;
  }
}

// =========================
// GENERAR DOCUMENTO PDF
// =========================
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

  const today = new Date().toLocaleDateString("es-AR");
  const cotizacionDate = new Date(quotation.createdAt).toLocaleDateString("es-AR");

  const plazos = coefficients.map((c: any) => c.plazo).sort((a: number, b: number) => a - b);

  const vehicle = quotation.vehicleVersion;
  const vehicleLinea = vehicle?.linea;
  const vehicleInfo = {
    marca: vehicleLinea?.marca?.descrip,
    version: vehicle?.descrip, 
    linea: vehicleLinea.descrip,
  };

  const rowCells = coefficients.map((c: any) => {
    const coefNum = Number(c.coeficiente);
    const cuota = Number(quotation.totalValue) * (coefNum / 10000);

    const tnaMostrar = Math.ceil(Number(c.tna));
    const isChequePlan = quotation.planVersion.plan.name.toUpperCase().includes("CHEQUE");
    const cantidadCheques = c.plazo + 1;

    const quebrantoP = Number(c.quebrantoFinanciero || 0) / 100;
    const quebranto = Math.ceil(Number(quotation.totalValue) * quebrantoP * 1.21);

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

    if (isChequePlan) {
      contenido.push({
        text: `${cantidadCheques} cheques de $${Math.ceil(cuota).toLocaleString("es-AR")} (1ro corr.)`,
        fontSize: 8,
        color: "#0044aa",
      });
    }

    if (!isChequePlan && quebranto > 0) {
      contenido.push({
        text: `Quebranto: $${quebranto.toLocaleString("es-AR")}`,
        fontSize: 8,
        color: "#555",
      });
    }

    if (cuotaBalon > 0) {
      contenido.push({
        text: `Cuota Balón: $${cuotaBalon.toLocaleString("es-AR")} meses: ${mesesBalon.join(", ")}`,
        fontSize: 8,
        color: "#b38300",
      });
    }

    return { stack: contenido, alignment: "center" };
  });
 
  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 30, 40, 30],

    content: [
      // ----------------- HEADER (NEGRO + BG #7d8385) -----------------
      {
        table: {
          widths: ["60%", "40%"],
          body: [
            [
              {
                stack: [
                  { text: company.name, style: "headerTitle" },
                  { text: `Fecha de Cotización: ${cotizacionDate}`, color: "white" },
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

      // -------- LINEA --------
      {
        canvas: [{ type: "line", x1: 0, y1: 15, x2: 515, y2: 15, lineWidth: 1 }],
        margin: [0, 10, 0, 20],
      },

      // ----------------- DATOS DEL CLIENTE -----------------
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
            ["Vehiculo", ` ${vehicleInfo.marca} - ${vehicleInfo.linea} - ${vehicleInfo.version}`],
            ["Monto Total", `$${Number(quotation.totalValue).toLocaleString("es-AR")}`],
          ],
        },
        layout: "noBorders",
        fontSize: 11,
        margin: [0, 5, 0, 15],
      },

      // ----------------- PLAN SECTION (BG #7d8385 + texto negro) -----------------
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
        margin: [0, 0, 0, 25],
      },

      // ----------------- TABLA COMPLETA COMO EL FORMULARIO -----------------
      {
        table: {
          widths: plazos.map(() => `${100 / plazos.length}%`),
          body: [
            plazos.map((p) => ({
              text: `${p} cuotas`,
              bold: true,
              alignment: "center",
              fillColor: "#eaeaea",
            })),
            rowCells,
          ],
        },
        layout: "lightHorizontalLines",
      },
    ],

    styles: {
      headerTitle: {
        fontSize: 20,
        bold: true,
        color: "white",
      },
      sectionTitle: { fontSize: 14, bold: true, },
      planName: { fontSize: 17, bold: true },
      vehicleHeader: { bold: true, fillColor: "#eaeaea" },
    },
  };

  return docDefinition;
}

