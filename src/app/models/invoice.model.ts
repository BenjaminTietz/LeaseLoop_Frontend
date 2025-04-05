export interface Invoice {
  id: number;
  bookingId: number;
  pdfFile: string; // URL to the PDF
  generatedAt: string; // ISO date
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
