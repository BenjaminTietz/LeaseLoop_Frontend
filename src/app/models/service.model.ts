export type ServiceType = 'one_time' | 'per_day';

export interface Service {
  id: number;
  name: string;
  price: number;
  type: ServiceType;
  propertyId: number;
}
