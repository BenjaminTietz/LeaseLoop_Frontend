import { Booking } from './booking.model';
import { PromoCode } from './promocode.model';
import { Service } from './service.model';
export interface Invoice {
  id: number;
  invoice_number: string;
  booking: Booking;
  pdf_file: string;
  deposit_paid: boolean;
  deposit_amount: number;
  rental_price: number;
  rental_days: number;
  services: Service[];
  total_price: number;
  promo_code?: PromoCode;
  created_at: string;
  updated_at: string;
}
