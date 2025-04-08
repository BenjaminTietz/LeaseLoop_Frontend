export interface PropertyImage {
  id: number;
  image: string; // URL
  alt_text: string;
  propertyId: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
