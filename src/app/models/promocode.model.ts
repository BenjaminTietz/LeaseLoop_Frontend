export interface PromoCode {
  id: number;
  code: string;
  description: string;
  valid_until: string; // ISO date
  discount_percent: number;
  owner_id: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
