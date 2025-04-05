export interface Address {
  id: number;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
  phone: string;
  ownerId: number; // Refers to the owner of the address
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
