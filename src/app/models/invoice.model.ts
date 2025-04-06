import { PromoCode } from './promocode.model';
export interface Invoice {
  id: number;
  bookingId: number;
  pdfFile: string; // URL to the PDF
  deposit_paid: boolean;
  deposit_amount: number;
  total_price: number;
  promo_code?: PromoCode;
  generatedAt: string; // ISO date
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
