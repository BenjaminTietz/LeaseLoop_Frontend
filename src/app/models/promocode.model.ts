export interface PromoCode {
  id: number;
  code: string;
  validUntil: string; // ISO date
  discountPercent: number;
  used: boolean;
  ownerId: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
