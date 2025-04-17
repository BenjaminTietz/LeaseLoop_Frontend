export interface RevenueStats {
  total_revenue: number;
}

export interface BookingStats {
  date: string;
  count: number;
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
