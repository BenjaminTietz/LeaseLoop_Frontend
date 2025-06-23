import { Amenity } from './amenity.model';
export interface Unit {
  id: number;
  name: string;
  capacity: number;
  type: string;
  price_per_extra_person: number;
  property: PropertyShort;
  status: string;
  created_at: string;
  updated_at: string;
  description: string;
  price_per_night: number;
  max_capacity: number;
  images: UnitImage[];
  active: boolean;
  deleted: boolean;
  amenities: number[];
  amenity_details?: Amenity[];
}

export interface PropertyShort {
  id: number;
  name: string;
  address: string;
}

export interface UnitImage {
  id: number;
  image: string;
  alt_text: string;
  propertyId: number;
  created_at: string;
  updated_at: string;
}
