import jsPDF from 'jspdf';
import JSZip from 'jszip';

/**
 * Renders the voucher onto a high-DPI HTML5 Canvas and returns a PNG Data URL
 */
export const generateVoucherCanvasDataUrl = (voucherData, scaleFactor = 3) => {
  return new Promise((resolve, reject) => {
    const {
      voucherNo = 'YTT-D-0001',
      voucherValue = '10000',
      issueDate = '06/10/2026',
      validUntil = '05/10/2027',
      overlayConfig = {}
    } = voucherData;

    const baseWidth = 1050;
    const baseHeight = 680;

    const canvas = document.createElement('canvas');
    canvas.width = baseWidth * scaleFactor;
    canvas.height = baseHeight * scaleFactor;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/voucher-template.jpg';

    img.onload = () => {
      // 1. Draw background template image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Extract config settings
      const fontSize = (overlayConfig.fontSize || 18) * scaleFactor;
      const fontColor = overlayConfig.fontColor || '#0a2c66';
      const fontWeight = overlayConfig.fontWeight || '800';
      const fontFamily = overlayConfig.fontFamily || 'Montserrat, sans-serif';

      const xShift = overlayConfig.xOffset || 0;
      const yShift = overlayConfig.yOffset || 0;

      const f1X = (overlayConfig.f1X || 0) + xShift;
      const f1Y = (overlayConfig.f1Y || 0) + yShift;

      const f2X = (overlayConfig.f2X || 0) + xShift;
      const f2Y = (overlayConfig.f2Y || 0) + yShift;

      const f3X = (overlayConfig.f3X || 0) + xShift;
      const f3Y = (overlayConfig.f3Y || 0) + yShift;

      const f4X = (overlayConfig.f4X || 0) + xShift;
      const f4Y = (overlayConfig.f4Y || 0) + yShift;

      const f5X = (overlayConfig.f5X || 0) + xShift;
      const f5Y = (overlayConfig.f5Y || 0) + yShift;

      const formattedValue = Number(voucherValue) ? Number(voucherValue).toLocaleString('en-IN') : voucherValue;

      // Ensure fonts are loaded or fallback to sans-serif
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.textBaseline = 'middle';

      // Field 1: Voucher No (Line 1 underline is at Y = 264px)
      const f1XPos = (208 + f1X) * scaleFactor;
      const f1YPos = (248 + f1Y) * scaleFactor;
      ctx.fillText(voucherNo, f1XPos, f1YPos);

      // Field 2: Voucher Value (Line 2 underline is at Y = 325px; sits right after ₹)
      ctx.font = `900 ${fontSize + (3 * scaleFactor)}px ${fontFamily}`;
      const f2XPos = (248 + f2X) * scaleFactor;
      const f2YPos = (308 + f2Y) * scaleFactor;
      ctx.fillText(formattedValue, f2XPos, f2YPos);

      // Field 3: Date of Issue (Line 3 underline is at Y = 384px)
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const f3XPos = (208 + f3X) * scaleFactor;
      const f3YPos = (367 + f3Y) * scaleFactor;
      ctx.fillText(issueDate, f3XPos, f3YPos);

      // Field 4: Valid Until (Line 4 underline is at Y = 444px)
      const f4XPos = (208 + f4X) * scaleFactor;
      const f4YPos = (427 + f4Y) * scaleFactor;
      ctx.fillText(validUntil, f4XPos, f4YPos);

      resolve(canvas.toDataURL('image/png', 1.0));
    };

    img.onerror = (err) => {
      reject(err);
    };
  });
};

/**
 * Download high resolution PNG image
 */
export const exportVoucherPNG = async (voucherData) => {
  const dataUrl = await generateVoucherCanvasDataUrl(voucherData, 3);
  const link = document.createElement('a');
  link.download = `Yogakshema_Voucher_${voucherData.voucherNo}.png`;
  link.href = dataUrl;
  link.click();
};

/**
 * Download print-ready PDF Document
 */
export const exportVoucherPDF = async (voucherData) => {
  const dataUrl = await generateVoucherCanvasDataUrl(voucherData, 3);
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const imgWidth = pdfWidth - (margin * 2);
  const imgHeight = (680 / 1050) * imgWidth;
  const yPos = (pdfHeight - imgHeight) / 2;

  pdf.addImage(dataUrl, 'PNG', margin, yPos, imgWidth, imgHeight);
  pdf.save(`Yogakshema_Voucher_${voucherData.voucherNo}.pdf`);
};

/**
 * Batch Export: Download all batch vouchers as a single multi-page PDF
 */
export const exportBatchVouchersPDF = async (voucherList) => {
  if (!voucherList || voucherList.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const imgWidth = pdfWidth - (margin * 2);
  const imgHeight = (680 / 1050) * imgWidth;
  const yPos = (pdfHeight - imgHeight) / 2;

  for (let i = 0; i < voucherList.length; i++) {
    const item = voucherList[i];
    const dataUrl = await generateVoucherCanvasDataUrl(item, 2.5);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(dataUrl, 'PNG', margin, yPos, imgWidth, imgHeight);
  }

  const startNo = voucherList[0]?.voucherNo || 'batch';
  const endNo = voucherList[voucherList.length - 1]?.voucherNo || '';
  pdf.save(`Yogakshema_Batch_Vouchers_${startNo}_to_${endNo}.pdf`);
};

/**
 * Batch Export: Download all batch vouchers as a ZIP archive of PNG images
 */
export const exportBatchVouchersZIP = async (voucherList) => {
  if (!voucherList || voucherList.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder("vouchers");

  for (let i = 0; i < voucherList.length; i++) {
    const item = voucherList[i];
    const dataUrl = await generateVoucherCanvasDataUrl(item, 2.5);
    // Remove base64 header
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    folder.file(`Yogakshema_Voucher_${item.voucherNo}.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  const startNo = voucherList[0]?.voucherNo || 'batch';
  const endNo = voucherList[voucherList.length - 1]?.voucherNo || '';

  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `Yogakshema_Batch_Vouchers_${startNo}_to_${endNo}.zip`;
  link.click();
};
