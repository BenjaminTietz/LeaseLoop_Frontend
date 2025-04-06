export interface Unit {
  id: number;
  propertyId: number;
  name: string;
  price_per_night: number;
  capacity: number;
  pricePerExtraPerson: number;
  property: PropertyShort;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

export interface PropertyShort {
  id: number;
  name: string;
  address: string;
}
