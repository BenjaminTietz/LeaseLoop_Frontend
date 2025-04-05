import { Service } from './service.model';
import { PromoCode } from './promocode.model';

export interface Booking {
  id: number;
  unitId: number;
  customerId: number;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  guests: number;
  totalPrice: number;
  depositRequired: boolean;
  depositPaid: boolean;
  depositAmount: number;
  status: string; // e.g., 'pending', 'confirmed', 'cancelled'
  services?: Service[];
  promoCode?: PromoCode;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
