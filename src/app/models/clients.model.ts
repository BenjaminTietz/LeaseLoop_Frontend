import { Address } from './adress.model';
export interface Clients {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: Address;
  user_id: number;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface ClientDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  address?: Address;
  user_id?: number;
  active?: boolean;
}
