import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Property } from '../../models/property.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropertiesService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  properties = signal<Property[]>([]);

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
}
