import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { QuotationFull } from "@/app/types/quotition";
import logoBase64 from "@/app/assets/logoBase64";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(value);

export const generateQuotationPdf = (quotation: QuotationFull) => {
  const doc = new jsPDF();
  const lineHeight = 10;
  let currentY = 15;

  doc.addImage(logoBase64, "PNG", 10, 5, 40, 15);

  doc.setFontSize(16);
  doc.text("Cotizacion", 150, 15, { align: "right" });
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 150, 22, { align: "right" });

  const vehicleLabel =
    quotation.vehicleVersion
      ? `${quotation.vehicleVersion.marca?.descrip ?? ""} ${quotation.vehicleVersion.linea?.descrip ?? ""} ${quotation.vehicleVersion.descrip}`.trim() ||
        quotation.vehicleVersion.descrip
      : "Sin vehiculo";

  autoTable(doc, {
    startY: currentY,
    head: [["Detalle de cotizacion"]],
    body: [
      ["Cliente", quotation.clientName],
      ["DNI", quotation.clientDni],
      ["Plan", quotation.planVersion.plan?.name ?? ""],
      ["Version de plan", `v${quotation.planVersion.version}`],
      ["Vehiculo", vehicleLabel],
      ["Valor total", quotation.totalValue ? formatCurrency(Number(quotation.totalValue)) : "No informado"],
    ],
    theme: "grid",
    styles: { fillColor: [46, 134, 193] },
  });

  currentY = (doc as any).lastAutoTable.finalY + lineHeight;

  const feeRows = quotation.planVersion.coefficients.map((coef) => [
    `${coef.plazo} meses`,
    `${coef.tna}%`,
    (Number(coef.coeficiente) / 10000).toFixed(6),
    coef.cuotaBalon ? formatCurrency(Number(coef.cuotaBalon)) : "-",
    coef.cuotaPromedio ? formatCurrency(Number(coef.cuotaPromedio)) : "-",
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Plazo", "TNA", "Coeficiente", "Cuota Balon", "Cuota Promedio"]],
    body: feeRows,
    theme: "striped",
  });

  doc.save(`cotizacion-${quotation.clientDni}.pdf`);
};
