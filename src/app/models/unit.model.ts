import { Equipment } from './equipment.model';

export interface Unit {
  id: number;
  propertyId: number;
  name: string;
  basePrice: number;
  baseCapacity: number;
  pricePerExtraPerson: number;
  equipments: Equipment[];
}
