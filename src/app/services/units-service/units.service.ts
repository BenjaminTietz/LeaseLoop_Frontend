import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Unit } from '../../models/unit.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  units = signal<Unit[]>([]);

  /** Load all units (admin or general fetch) */
  loadUnits() {
    this.httpService
      .get<Unit[]>(`${environment.apiBaseUrl}/api/units/`)
      .subscribe({
        next: (data) => this.units.set(data),
        error: (error) => console.error('Failed to load units', error),
      });
  }

  /** Get all units for a specific property */
  getUnitsForProperty(propertyId: number) {
    return this.httpService.get<Unit[]>(
      `${environment.apiBaseUrl}/api/properties/${propertyId}/units/`
    );
  }

  /** Create a unit */
  createUnit(data: Partial<Unit>) {
    return this.httpService.post<Unit>(
      `${environment.apiBaseUrl}/api/units/`,
      data
    );
  }

  /** Update a unit */
  updateUnit(id: number, data: Partial<Unit>) {
    return this.httpService.patch<Unit>(
      `${environment.apiBaseUrl}/api/units/${id}/`,
      data
    );
  }

  /** Delete a unit */
  deleteUnit(id: number) {
    return this.httpService.delete(
      `${environment.apiBaseUrl}/api/units/${id}/`
    );
  }
}
