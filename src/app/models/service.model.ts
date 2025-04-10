export type ServiceType = 'one_time' | 'per_day';

export interface Service {
  id: number;
  name: string;
  price: number; // TODO: Check if this is a number or string in the API
  type: ServiceType;
  property: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  property_info: PropertyShort;
}

export interface PropertyShort {
  id: number;
  name: string;
  address: string;
}

export interface ServiceDto {
  name?: string;
  type?: ServiceType;
  price?: number;
  description?: string;
  property?: number;
}
