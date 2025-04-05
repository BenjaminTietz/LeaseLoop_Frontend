export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  adress: number;
  userId: number; // Refers to auth user
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
