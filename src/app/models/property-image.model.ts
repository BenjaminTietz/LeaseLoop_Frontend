export interface PropertyImage {
  id: number;
  image: string; // URL
  altText: string;
  propertyId: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
}
