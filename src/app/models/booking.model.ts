import { Service } from './service.model';
import { PromoCode } from './promocode.model';

export interface Booking {
  id: number;
  unit_id: number;
  client_id: number;
  check_in: string; // ISO date
  check_out: string; // ISO date
  guests: number;
  total_price: number;
  deposit_paid: boolean;
  deposit_amount: number;
  status: string; // e.g., 'pending', 'confirmed', 'cancelled'
  services?: Service[];
  promo_code?: PromoCode;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
