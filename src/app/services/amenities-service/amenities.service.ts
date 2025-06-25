import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { Amenity } from '../../models/amenity.model';

@Injectable({
  providedIn: 'root',
})
export class AmenitiesService {
  http = inject(HttpService);
  BASE_URL = environment.apiBaseUrl;
  allAmenities = signal<Amenity[]>([]);

  /**
   * Constructor that initializes the service by fetching all amenities.
   * @returns void
   */
  constructor() {
    this.getAllAmenities();
  }

  /**
   * Fetches all amenities from the server and updates the `allAmenities` signal.
   *
   * This method sends an HTTP GET request to the `/api/amenities/` endpoint.
   * Upon receiving a successful response, it sets the `allAmenities` signal
   * with the fetched amenities data, which is cast to an array of `Amenity` objects.
   */
  getAllAmenities() {
    this.http.get(this.BASE_URL + '/api/amenities/').subscribe((res) => {
      this.allAmenities.set(res as Amenity[]);
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
