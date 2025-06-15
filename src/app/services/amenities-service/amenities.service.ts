import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { Amenity } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root'
})
export class AmenitiesService {
  http = inject(HttpService)
  BASE_URL = environment.apiBaseUrl
  allAmenities = signal<Amenity[]>([]);
  constructor() {
    this.getAllAmenities()
   }

  getAllAmenities() {
    this.http.get(this.BASE_URL + '/api/amenities/').subscribe(res => {
      this.allAmenities.set(res as Amenity[])
    });
  }

  groupedAmenities = computed(() => {
  let grouped: Record<string, { id: number; label: string }[]> = {};

  for (let amenity of this.allAmenities()) {
    let category = amenity.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({
      id: amenity.id,
      label: amenity.label,
    });
  }
  for (const category in grouped) {
    grouped[category].sort((a, b) => a.label.localeCompare(b.label));
  }

  return grouped;
  });
}
