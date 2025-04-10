export interface Clients {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  userId: number; // Refers to auth user
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

// TODO: Refactor the adress field to a separate model Street, HouseNumber, City, State, ZipCode, Country

export interface ClientDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  address?: string;
  userId?: number; // Refers to auth user
}
