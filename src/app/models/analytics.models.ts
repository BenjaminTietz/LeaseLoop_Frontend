export interface RevenueStats {
  total_revenue: number;
}

export interface UnitBookingStats {
  unit: string;
  total: number;
  confirmed: number;
  cancelled: number;
  [status: string]: number | string;
}

export interface PropertyBookingStats {
  property: string;
  units: UnitBookingStats[];
}

export interface ServiceStats {
  name: string;
  sales: number;
}

export interface Property {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  propertyId: string;
}
