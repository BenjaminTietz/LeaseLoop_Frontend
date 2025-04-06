export interface Clients {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  adress: number;
  userId: number; // Refers to auth user
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
