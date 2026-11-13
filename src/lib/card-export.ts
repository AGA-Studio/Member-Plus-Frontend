import { toBlob, toJpeg } from "html-to-image";

const imagePixelRatio = 4;
const pdfCardWidthPoints = 372;
const pdfMarginPoints = 24;
const jpegQuality = 0.95;

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function captureCardAsPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const blob = await toBlob(node, { pixelRatio: imagePixelRatio, cacheBust: true });
  if (!blob) throw new Error("Card image could not be created");

  return blob;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function buildPdf(jpeg: Uint8Array, imageWidth: number, imageHeight: number): Blob {
  const encoder = new TextEncoder();
  const text = (value: string) => encoder.encode(value);

  const cardWidth = pdfCardWidthPoints;
  const cardHeight = Math.round((cardWidth * imageHeight) / imageWidth);
  const pageWidth = cardWidth + pdfMarginPoints * 2;
  const pageHeight = cardHeight + pdfMarginPoints * 2;
  const content = `q ${cardWidth} 0 0 ${cardHeight} ${pdfMarginPoints} ${pdfMarginPoints} cm /Im0 Do Q`;

  const objects: Uint8Array[][] = [
    [text("<< /Type /Catalog /Pages 2 0 R >>")],
    [text("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")],
    [
      text(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>`,
      ),
    ],
    [text(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)],
    [
      text(
        `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      ),
      jpeg,
      text("\nendstream"),
    ],
  ];

  const chunks: Uint8Array[] = [text("%PDF-1.4\n")];
  const offsets: number[] = [];
  let position = chunks[0].length;

  objects.forEach((parts, index) => {
    offsets.push(position);
    const body = concatBytes([text(`${index + 1} 0 obj\n`), ...parts, text("\nendobj\n")]);
    chunks.push(body);
    position += body.length;
  });

  const xrefOffset = position;
  const entries = offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  chunks.push(
    text(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${entries}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
    ),
  );

  return new Blob([concatBytes(chunks) as BlobPart], { type: "application/pdf" });
}

function readImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Card image could not be read"));
    image.src = dataUrl;
  });
}

export async function captureCardAsPdf(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const dataUrl = await toJpeg(node, {
    pixelRatio: imagePixelRatio,
    cacheBust: true,
    quality: jpegQuality,
    backgroundColor: "white",
  });
  const { width, height } = await readImageSize(dataUrl);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const jpeg = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

  return buildPdf(jpeg, width, height);
}
