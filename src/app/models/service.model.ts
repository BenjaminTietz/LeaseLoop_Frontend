export type ServiceType = 'one_time' | 'per_day';

export interface Service {
  id: number;
  name: string;
  price: number;
  type: ServiceType;
  property_id: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  property_info: PropertyShort;
}

export interface PropertyShort {
  id: number;
  name: string;
  address: string;
}
