export interface Invoice {
  id: number;
  bookingId: number;
  pdfFile: string; // URL to the PDF
  generatedAt: string; // ISO date
}
