import { PropertyImage } from './property-image.model';

export interface Property {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  description: string;
  images: PropertyImage[];
}
