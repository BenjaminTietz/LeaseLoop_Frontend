export interface PromoCode {
  id: number;
  code: string;
  description: string;
  valid_until: string;
  discount_percent: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface PromoDto {
  code?: string;
  description?: string;
  valid_until?: string;
  discount_percent?: number;
  active?: boolean;
}
