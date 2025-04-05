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
  services: Service[];
  promoCode?: PromoCode;
}
