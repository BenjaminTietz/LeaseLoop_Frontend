export interface Unit {
  id: number;
  name: string;
  capacity: number;
  pricePerExtraPerson: number;
  property: PropertyShort // PropertyShort;
  status: string; // 'available' | 'booked' | 'cleaning' | 'maintenance'
  created_at: string; // ISO date
  updated_at: string; // ISO date
  description: string;
  price_per_night: number
}

export interface PropertyShort {
  id: number;
  name: string;
  address: string;
}
