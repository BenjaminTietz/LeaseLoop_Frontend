export interface Unit {
  id: number;
  propertyId: number;
  name: string;
  basePrice: number;
  baseCapacity: number;
  pricePerExtraPerson: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
