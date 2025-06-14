import { Address } from './adress.model';
import { PropertyImage } from './property-image.model';
import { Unit } from './unit.model';

export interface Property {
  active :boolean;
  id: number;
  owner: number;
  name: string;
  address: Address
  email: string
  description: string;
  images: PropertyImage[];
  units: Unit[];
  status: string;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
