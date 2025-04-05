export interface SeasonalPricing {
  id: number;
  propertyId: number;
  seasonName: string;
  startDate: string; // ISO
  endDate: string;
  priceModifierPercent: number;
}
