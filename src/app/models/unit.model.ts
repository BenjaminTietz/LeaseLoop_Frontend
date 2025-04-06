export interface Unit {
  id: number;
  propertyId: number;
  name: string;
  price_per_night: number;
  capacity: number;
  pricePerExtraPerson: number;
  property: PropertyShort;
  status: string; // 'available' | 'booked' | 'cleaning' | 'maintenance'
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

export interface PropertyShort {
  id: number;
  name: string;
  address: string;
}
