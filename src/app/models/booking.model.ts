import { Service } from './service.model';
import { PromoCode } from './promocode.model';
import { Clients } from './clients.model';
import { Unit } from './unit.model';

export interface Booking {
  id: number;
  unit: Unit;
  client: Clients;
  check_in: string; // ISO date
  check_out: string; // ISO date
  total_days: number; // <-- TODO: include into backend
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
