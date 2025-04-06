import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Property } from '../../models/property.model';
import { Unit } from '../../models/unit.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  properties = signal<Property[]>([]);
  units = signal<Unit[]>([]);

  /** Load all properties owned by the current user */
  loadProperties() {
    return this.httpService
      .get<Property[]>(`${environment.apiBaseUrl}/api/properties/`)
      .pipe(
        tap((data) => this.properties.set(data)),
        catchError((error) => {
          console.error('Failed to load properties', error);
          return throwError(() => error);
        })
      );
  }

  /** Load a single property by its ID */
  getProperty(id: number) {
    return this.httpService.get<Property>(
      `${environment.apiBaseUrl}/api/properties/${id}/`
    );
  }

  /** Create a new property */
  createProperty(data: Partial<Property>) {
    return this.httpService.post<Property>(
      `${environment.apiBaseUrl}/api/properties/`,
      data
    );
  }

  /** Update an existing property */
  updateProperty(id: number, data: Partial<Property>) {
    return this.httpService.patch<Property>(
      `${environment.apiBaseUrl}/api/properties/${id}/`,
      data
    );
  }

  /** Delete a property */
  deleteProperty(id: number) {
    return this.httpService.delete(
      `${environment.apiBaseUrl}/api/properties/${id}/`
    );
  }

  /** Load all units (admin or general fetch) */
  loadUnits() {
    return this.httpService
      .get<Unit[]>(`${environment.apiBaseUrl}/api/units/`)
      .pipe(
        tap((data) => this.units.set(data)),
        catchError((error) => {
          console.error('Failed to load units', error);
          return throwError(() => error);
        })
      );
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
