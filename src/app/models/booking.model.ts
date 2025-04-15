import { Service } from './service.model';
import { PromoCode } from './promocode.model';
import { Clients } from './clients.model';
import { Unit } from './unit.model';
import { Property } from './property.model';

export interface Booking {
  id: number;
  unit: Unit;
  client: Clients;
  check_in: string; // ISO date
  check_out: string; // ISO date
  total_days: number;
  guests_count: number;
  total_price: number;
  deposit_paid: boolean;
  deposit_amount: number;
  base_renting_price: number;
  total_services_price: number;
  discount_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  services: Service[];
  promo_code?: PromoCode;
  created_at: string;
  updated_at: string;
  property: Property;
}
