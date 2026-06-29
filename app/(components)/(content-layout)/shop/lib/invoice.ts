// app/(components)/(content-layout)/shop/lib/invoice.ts
// Shop - sipariş için PDF fatura üretimi ve Resend ile e-posta gönderimi.
// pdf-lib StandardFont (Helvetica) yalnızca WinAnsi karakterlerini desteklediği
// için Türkçe karakterleri ASCII'ye sadeleştiriyoruz (aksi halde çizimde hata atar).
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Resend } from "resend";

// Faturaya yazılacak sipariş + ürün bilgisi (route'lardan beslenir)
export interface InvoiceData {
  id: string;
  createdAt: Date | string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  productName: string;
  currency: string;
}

// Türkçe karakterleri WinAnsi uyumlu ASCII karşılıklarına çevirir.
const ascii = (s: string) =>
  String(s ?? "")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/₺/g, "TL")
    // pdf-lib'in çizemeyeceği kalan karakterleri temizle
    .replace(/[^\x20-\x7E]/g, "");

const money = (n: number, currency: string) =>
  `${ascii(currency)} ${Number(n).toFixed(2)}`;

// Sipariş için A4 PDF fatura üretir, byte dizisi döner.
export async function buildInvoicePdf(order: InvoiceData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const text = (
    s: string,
    x: number,
    y: number,
    size = 11,
    f = font,
    color = rgb(0.1, 0.1, 0.1)
  ) => page.drawText(ascii(s), { x, y, size, font: f, color });

  // Başlık
  text("FATURA / INVOICE", margin, height - margin, 24, bold);
  text("Magaza", width - margin - 120, height - margin, 16, bold, rgb(0.2, 0.4, 0.9));

  let y = height - margin - 50;

  // Fatura meta
  text(`Fatura No: ${order.id}`, margin, y);
  y -= 18;
  text(
    `Tarih: ${new Date(order.createdAt).toLocaleDateString("tr-TR")}`,
    margin,
    y
  );
  y -= 18;
  text(`Durum: ${order.status}`, margin, y);

  y -= 40;
  // Müşteri
  text("Musteri Bilgileri", margin, y, 13, bold);
  y -= 20;
  [
    order.customerName,
    order.email,
    order.phone,
    `${order.address}, ${order.city}`,
  ].forEach((line) => {
    text(line, margin, y);
    y -= 16;
  });

  y -= 24;
  // Tablo başlığı
  page.drawLine({
    start: { x: margin, y: y + 14 },
    end: { x: width - margin, y: y + 14 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  text("Urun", margin, y, 10, bold);
  text("Adet", margin + 280, y, 10, bold);
  text("Birim", margin + 350, y, 10, bold);
  text("Tutar", margin + 440, y, 10, bold);
  y -= 8;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 22;
  // Satır
  text(order.productName, margin, y, 10);
  text(String(order.quantity), margin + 280, y, 10);
  text(money(order.unitPrice, order.currency), margin + 350, y, 10);
  text(money(order.totalPrice, order.currency), margin + 440, y, 10);

  y -= 40;
  page.drawLine({
    start: { x: width - margin - 200, y: y + 16 },
    end: { x: width - margin, y: y + 16 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  text("Genel Toplam:", width - margin - 200, y, 13, bold);
  text(money(order.totalPrice, order.currency), width - margin - 90, y, 13, bold);

  // Alt bilgi
  text(
    "Bu belge elektronik olarak olusturulmustur. Bizi tercih ettiginiz icin tesekkurler.",
    margin,
    margin,
    9,
    font,
    rgb(0.5, 0.5, 0.5)
  );

  return pdf.save();
}

// Faturayı müşteriye e-posta ile gönderir (PDF eki + HTML gövde).
export async function sendInvoiceEmail(order: InvoiceData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[shop/invoice] RESEND_API_KEY tanimli degil, mail atlandi");
    return;
  }

  const resend = new Resend(apiKey);
  const pdfBytes = await buildInvoicePdf(order);
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  const fmt = (n: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: order.currency || "TRY",
    }).format(n);

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:28px 24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:22px">Siparişiniz Alındı 🎉</h1>
      <p style="margin:6px 0 0;opacity:.9">Faturanız ektedir.</p>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 12px 12px">
      <p>Merhaba <strong>${order.customerName}</strong>,</p>
      <p>Aşağıdaki siparişiniz için ödemeniz başarıyla alınmıştır.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#6b7280">Fatura No</td><td style="text-align:right"><strong>${order.id}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Ürün</td><td style="text-align:right">${order.productName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Adet</td><td style="text-align:right">${order.quantity}</td></tr>
        <tr style="border-top:1px solid #e5e7eb"><td style="padding:12px 0;font-size:18px"><strong>Toplam</strong></td><td style="text-align:right;font-size:18px;color:#4f46e5"><strong>${fmt(order.totalPrice)}</strong></td></tr>
      </table>
      <p style="color:#6b7280;font-size:13px">Teslimat: ${order.address}, ${order.city}</p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Bu e-posta otomatik olarak gönderilmiştir.</p>
    </div>
  </div>`;

  await resend.emails.send({
    from,
    to: order.email,
    subject: `Faturanız - Sipariş #${String(order.id).slice(0, 8)}`,
    html,
    attachments: [
      {
        filename: `fatura-${String(order.id).slice(0, 8)}.pdf`,
        content: Buffer.from(pdfBytes),
      },
    ],
  });

  console.log("[shop/invoice] fatura e-postasi gonderildi:", order.email);
}
