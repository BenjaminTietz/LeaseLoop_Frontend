export type ServiceType = 'one_time' | 'per_day';

export interface Service {
  id: number;
  name: string;
  price: number;
  type: ServiceType;
  property: number;
  created_at: string;
  updated_at: string;
  property_info: PropertyShort;
  active: boolean;
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
  property?: number;
  active?: boolean;
}
