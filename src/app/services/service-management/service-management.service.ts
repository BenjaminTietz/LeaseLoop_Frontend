import { inject, Injectable, signal } from '@angular/core';
import { Service } from '../../models/service.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, tap } from 'rxjs';
import { HttpService } from '../httpclient/http.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceManagementService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  services = signal<Service[]>([]);

  /** Load all services assoziated to current user / property */
  loadService() {
    return this.httpService
      .get<Service[]>(`${environment.apiBaseUrl}/api/services/`)
      .pipe(
        tap((data) => this.services.set(data)),
        catchError((error) => {
          console.error('Failed to load services', error);
          return throwError(() => error);
        })
      );
  }

  /** Load a single Service by its ID */
  getService(id: number) {
    return this.httpService.get<Service>(
      `${environment.apiBaseUrl}/api/service/${id}/`
    );
  }

  /** Create a new Service */
  createService(data: Partial<Service>) {
    return this.httpService.post<Service>(
      `${environment.apiBaseUrl}/api/services/`,
      data
    );
  }

  /** Update an existing Service */
  updateService(id: number, data: Partial<Service>) {
    return this.httpService.patch<Service>(
      `${environment.apiBaseUrl}/api/service/${id}/`,
      data
    );
  }

  /** Delete a Service */
  deleteService(id: number) {
    return this.httpService.delete(
      `${environment.apiBaseUrl}/api/service/${id}/`
    );
  }
}
