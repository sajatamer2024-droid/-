import { jsPDF } from 'jspdf';
import { CartItem } from '../types/catering';

export interface InvoicePdfInput {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  eventDate: string;
  eventTimeSlot: string;
  orderNotes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount?: number;
  discountLabel?: string;
  grandTotal: number;
}

const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const MARGIN_X = 72;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - 130;

function createPageCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('تعذر تهيئة لوحة الرسم لإنشاء الفاتورة');
  }

  // Clean paper white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  // Subtle top brand accent stripe
  ctx.fillStyle = '#B85333';
  ctx.fillRect(0, 0, PAGE_WIDTH, 16);

  ctx.direction = 'rtl';
  return { canvas, ctx };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const cleaned = text.trim();
  if (!cleaned) return [];
  const words = cleaned.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (ctx.measureText(word).width > maxWidth) {
        let chunk = '';
        for (const ch of word) {
          if (ctx.measureText(chunk + ch).width <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawTableHeader(ctx: CanvasRenderingContext2D, y: number): number {
  const headerH = 52;
  drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, headerH, 12);
  ctx.fillStyle = '#231815';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 21px Cairo, sans-serif';
  ctx.textBaseline = 'middle';

  const midY = y + headerH / 2;
  ctx.textAlign = 'center';
  ctx.fillText('م', PAGE_WIDTH - MARGIN_X - 34, midY);

  ctx.textAlign = 'right';
  ctx.fillText('البوكس / الصنف والتفاصيل', PAGE_WIDTH - MARGIN_X - 80, midY);

  ctx.textAlign = 'center';
  ctx.fillText('الكمية', MARGIN_X + 350, midY);
  ctx.fillText('سعر الوحدة', MARGIN_X + 215, midY);

  ctx.textAlign = 'left';
  ctx.fillText('الإجمالي', MARGIN_X + 24, midY);

  return y + headerH + 8;
}

function drawFooter(ctx: CanvasRenderingContext2D, pageIndex: number, totalPages: number) {
  ctx.strokeStyle = '#E8DCD0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(MARGIN_X, PAGE_HEIGHT - 96);
  ctx.lineTo(PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 96);
  ctx.stroke();

  ctx.fillStyle = '#7D6B64';
  ctx.font = '600 18px Cairo, sans-serif';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'right';
  ctx.fillText(
    'شكراً لاختياركم متجر بَهْجَة للضيافة — نتمنى لكم مناسبة سعيدة ومميزة',
    PAGE_WIDTH - MARGIN_X,
    PAGE_HEIGHT - 58
  );

  ctx.textAlign = 'left';
  ctx.fillStyle = '#9C887E';
  ctx.fillText(`صفحة ${pageIndex} من ${totalPages}`, MARGIN_X, PAGE_HEIGHT - 58);
}

export async function generateInvoicePdf(data: InvoicePdfInput): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const pages: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }[] = [];
  let currentPage = createPageCanvas();
  pages.push(currentPage);

  let { ctx } = currentPage;
  let y = 52;

  // --- Header Card ---
  drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, 152, 18);
  ctx.fillStyle = '#FAF6F0';
  ctx.fill();
  ctx.strokeStyle = '#E8DCD0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Brand title (Right)
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#B85333';
  ctx.beginPath();
  ctx.arc(PAGE_WIDTH - MARGIN_X - 42, y + 48, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#231815';
  ctx.font = '800 34px Cairo, sans-serif';
  ctx.fillText('بَهْجَة للضيافة', PAGE_WIDTH - MARGIN_X - 64, y + 26);

  ctx.fillStyle = '#6B5B55';
  ctx.font = '600 21px Cairo, sans-serif';
  ctx.fillText('فاتورة ملخص الطلب والأسعار — توزيعات وضيافة المناسبات', PAGE_WIDTH - MARGIN_X - 32, y + 84);

  // Invoice badge (Left)
  const nowStr = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  drawRoundedRect(ctx, MARGIN_X + 24, y + 24, 300, 104, 14);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#DECFC0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#B85333';
  ctx.font = '800 24px Cairo, sans-serif';
  ctx.fillText(`#${data.invoiceNumber}`, MARGIN_X + 42, y + 38);

  ctx.fillStyle = '#7D6B64';
  ctx.font = '600 17px Cairo, sans-serif';
  ctx.fillText(`التاريخ: ${nowStr}`, MARGIN_X + 42, y + 82);

  y += 178;

  // --- Customer & Delivery Details Card ---
  ctx.font = '600 20px Cairo, sans-serif';
  const addressLines = wrapText(ctx, data.deliveryAddress || 'غير محدد', 440);
  const notesLines = data.orderNotes ? wrapText(ctx, data.orderNotes, CONTENT_WIDTH - 190) : [];

  const detailsBoxHeight =
    132 +
    Math.max(0, addressLines.length - 1) * 28 +
    (notesLines.length > 0 ? 18 + notesLines.length * 28 : 0);

  drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, detailsBoxHeight, 16);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#E8DCD0';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.fillStyle = '#231815';
  ctx.font = '800 22px Cairo, sans-serif';
  ctx.fillText('بيانات العميل والتسليم', PAGE_WIDTH - MARGIN_X - 28, y + 20);

  const infoYStart = y + 60;
  ctx.font = '600 20px Cairo, sans-serif';

  // Right column: Name & Phone
  ctx.fillStyle = '#7D6B64';
  ctx.fillText('العميل:', PAGE_WIDTH - MARGIN_X - 28, infoYStart);
  ctx.fillStyle = '#231815';
  ctx.fillText(data.customerName || 'ضيف عزيز', PAGE_WIDTH - MARGIN_X - 115, infoYStart);

  ctx.fillStyle = '#7D6B64';
  ctx.fillText('الجوال:', PAGE_WIDTH - MARGIN_X - 28, infoYStart + 34);
  ctx.fillStyle = '#231815';
  ctx.fillText(data.customerPhone || 'غير محدد', PAGE_WIDTH - MARGIN_X - 115, infoYStart + 34);

  // Left column: Event date & Address
  const leftColX = MARGIN_X + 540;
  ctx.fillStyle = '#7D6B64';
  ctx.fillText('موعد الحفل:', leftColX, infoYStart);
  ctx.fillStyle = '#231815';
  ctx.fillText(`${data.eventDate || 'في أقرب وقت'} (${data.eventTimeSlot})`, leftColX - 118, infoYStart);

  ctx.fillStyle = '#7D6B64';
  ctx.fillText('العنوان:', leftColX, infoYStart + 34);
  ctx.fillStyle = '#231815';
  addressLines.forEach((line, idx) => {
    ctx.fillText(line, leftColX - 88, infoYStart + 34 + idx * 28);
  });

  if (notesLines.length > 0) {
    const noteY = infoYStart + 72 + Math.max(0, addressLines.length - 1) * 28;
    ctx.fillStyle = '#7D6B64';
    ctx.fillText('ملاحظات:', PAGE_WIDTH - MARGIN_X - 28, noteY);
    ctx.fillStyle = '#4B3E38';
    notesLines.forEach((line, idx) => {
      ctx.fillText(line, PAGE_WIDTH - MARGIN_X - 125, noteY + idx * 28);
    });
  }

  y += detailsBoxHeight + 28;

  // --- Items Table ---
  y = drawTableHeader(ctx, y);

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];

    ctx.font = '700 21px Cairo, sans-serif';
    const titleLines = wrapText(ctx, item.title, 540);

    ctx.font = '500 17px Cairo, sans-serif';
    const detailLines: string[] = [];
    if (item.details && item.details.length > 0) {
      for (const d of item.details.slice(0, 4)) {
        const wrapped = wrapText(ctx, `• ${d}`, 530);
        detailLines.push(...wrapped);
      }
    }

    const rowHeight = Math.max(66, 26 + titleLines.length * 30 + detailLines.length * 24 + 14);

    if (y + rowHeight > BOTTOM_LIMIT) {
      currentPage = createPageCanvas();
      pages.push(currentPage);
      ctx = currentPage.ctx;
      y = 56;

      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#231815';
      ctx.font = '800 24px Cairo, sans-serif';
      ctx.fillText(`تابع فاتورة بَهْجَة #${data.invoiceNumber}`, PAGE_WIDTH - MARGIN_X, y);
      y += 46;
      y = drawTableHeader(ctx, y);
    }

    drawRoundedRect(ctx, MARGIN_X, y, CONTENT_WIDTH, rowHeight, 10);
    ctx.fillStyle = i % 2 === 0 ? '#FAF7F5' : '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#EFE6DE';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.textBaseline = 'top';

    // Index
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8C766B';
    ctx.font = '700 20px Cairo, sans-serif';
    ctx.fillText(String(i + 1), PAGE_WIDTH - MARGIN_X - 34, y + 20);

    // Title & details
    ctx.textAlign = 'right';
    ctx.fillStyle = '#231815';
    ctx.font = '700 21px Cairo, sans-serif';
    titleLines.forEach((line, idx) => {
      ctx.fillText(line, PAGE_WIDTH - MARGIN_X - 80, y + 16 + idx * 30);
    });

    if (detailLines.length > 0) {
      ctx.fillStyle = '#7D6B64';
      ctx.font = '500 17px Cairo, sans-serif';
      const detailStartY = y + 20 + titleLines.length * 30;
      detailLines.forEach((line, idx) => {
        ctx.fillText(line, PAGE_WIDTH - MARGIN_X - 84, detailStartY + idx * 24);
      });
    }

    // Quantity
    ctx.textAlign = 'center';
    ctx.fillStyle = '#231815';
    ctx.font = '700 20px Cairo, sans-serif';
    ctx.fillText(`${item.quantity}`, MARGIN_X + 350, y + 20);

    // Unit price
    ctx.fillStyle = '#6B5B55';
    ctx.font = '600 19px Cairo, sans-serif';
    ctx.fillText(`${item.price} ج.م`, MARGIN_X + 215, y + 20);

    // Line total
    ctx.textAlign = 'left';
    ctx.fillStyle = '#B85333';
    ctx.font = '800 21px Cairo, sans-serif';
    ctx.fillText(`${item.price * item.quantity} ج.م`, MARGIN_X + 24, y + 20);

    y += rowHeight + 8;
  }

  // --- Summary Totals Card ---
  const hasDiscount = (data.discountAmount || 0) > 0;
  const summaryHeight = hasDiscount ? 238 : 198;
  if (y + summaryHeight + 24 > BOTTOM_LIMIT) {
    currentPage = createPageCanvas();
    pages.push(currentPage);
    ctx = currentPage.ctx;
    y = 64;
  } else {
    y += 18;
  }

  const summaryW = 540;
  const summaryX = MARGIN_X;
  drawRoundedRect(ctx, summaryX, y, summaryW, summaryHeight, 16);
  ctx.fillStyle = '#FAF6F0';
  ctx.fill();
  ctx.strokeStyle = '#DECFC0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textBaseline = 'middle';

  // Subtotal
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6B5B55';
  ctx.font = '600 21px Cairo, sans-serif';
  ctx.fillText('المجموع الفرعي:', summaryX + summaryW - 28, y + 40);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#231815';
  ctx.font = '700 22px Cairo, sans-serif';
  ctx.fillText(`${data.subtotal} ج.م`, summaryX + 28, y + 40);

  // Delivery fee
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6B5B55';
  ctx.font = '600 21px Cairo, sans-serif';
  ctx.fillText('التوصيل المبرد:', summaryX + summaryW - 28, y + 84);

  ctx.textAlign = 'left';
  ctx.fillStyle = data.deliveryFee === 0 ? '#047857' : '#231815';
  ctx.font = '700 21px Cairo, sans-serif';
  ctx.fillText(
    data.deliveryFee === 0 ? 'مجاني' : `${data.deliveryFee} ج.م`,
    summaryX + 28,
    y + 84
  );

  let dividerOffset = 114;
  if (hasDiscount) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#047857';
    ctx.font = '700 20px Cairo, sans-serif';
    ctx.fillText(data.discountLabel || 'خصم بطاقة الهدايا:', summaryX + summaryW - 28, y + 126);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#047857';
    ctx.font = '800 21px Cairo, sans-serif';
    ctx.fillText(`-${data.discountAmount} ج.م`, summaryX + 28, y + 126);
    dividerOffset = 154;
  }

  // Divider
  ctx.strokeStyle = '#DECFC0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(summaryX + 24, y + dividerOffset);
  ctx.lineTo(summaryX + summaryW - 24, y + dividerOffset);
  ctx.stroke();

  // Grand total
  const grandTotalY = y + dividerOffset + 40;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#231815';
  ctx.font = '800 25px Cairo, sans-serif';
  ctx.fillText('الإجمالي المستحق:', summaryX + summaryW - 28, grandTotalY);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#B85333';
  ctx.font = '800 30px Cairo, sans-serif';
  ctx.fillText(`${data.grandTotal} ج.م`, summaryX + 28, grandTotalY);

  // Draw footers with total page numbers
  pages.forEach((p, idx) => {
    drawFooter(p.ctx, idx + 1, pages.length);
  });

  // Compile Canvas pages into A4 PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pages.forEach((p, idx) => {
    if (idx > 0) {
      pdf.addPage('a4', 'portrait');
    }
    const imgData = p.canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  });

  const safeInvoiceNum = data.invoiceNumber.replace(/[^A-Za-z0-9_-]/g, '');
  pdf.save(`bahjah-invoice-${safeInvoiceNum}.pdf`);
}
