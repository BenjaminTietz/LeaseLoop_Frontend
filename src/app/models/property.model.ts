import { Address } from './adress.model';
import { PropertyImage } from './property-image.model';
import { Unit } from './unit.model';

export interface Property {
  active :boolean;
  id: number;
  ownerId: number;
  name: string;
  address: Address
  description: string;
  images: PropertyImage[];
  units: Unit[];
  status: string;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
