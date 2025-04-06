import { PropertyImage } from './property-image.model';
import { Unit } from './unit.model';

export interface Property {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  description: string;
  images: PropertyImage[];
  units: Unit[];
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
