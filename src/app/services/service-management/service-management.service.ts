import { inject, Injectable, signal } from '@angular/core';
import { Service, ServiceDto } from '../../models/service.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, tap } from 'rxjs';
import { HttpService } from '../httpclient/http.service';
import { FormService } from '../form-service/form.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceManagementService {
  httpService = inject(HttpService);
  formService = inject(FormService);
  services = signal<Service[]>([]);
  selectedService = signal<Service | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);

  /**
   * Load all services from the server.
   *
   * This function sends a GET request to the server to retrieve all services.
   * It updates the local services list by setting the services signal to the
   * received data. It also logs any errors to the console and rethrows them
   * as an RxJS error.
   *
   * @returns An observable that emits the received services.
   */
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

  /**
   * Creates a new service with the given data.
   *
   * This function sends a POST request to the server to create the specified
   * service. It adds the new service to the local service list. It also manages
   * the UI state by setting the sending and successful signals, and resetting
   * the selectedService and formOpen signals.
   *
   * @param data - The data to be used to create the new service.
   */
  createService(data: ServiceDto) {
    this.sending.set(true);
    this.httpService
      .post<Service>(`${environment.apiBaseUrl}/api/services/`, data)
      .subscribe({
        next: (service) => {
          const current = this.services();
          this.services.set([...current, service]);

          this.sending.set(false);
          this.successful.set(true);
          this.selectedService.set(null);
        },
        error: (err) => {
          console.error('Failed to create service:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }

  /**
   * Updates an existing service with the given data.
   *
   * This function sends a PATCH request to the server to update the specified
   * service. It updates the local service list by replacing the existing
   * service with the updated one. It also manages the UI state by setting the
   * sending and successful signals, and resetting the selectedService and
   * formOpen signals.
   *
   * @param id - The ID of the service to be updated.
   * @param data - The data to be used for the update.
   */
  updateService(id: number, data: ServiceDto) {
    this.sending.set(true);
    this.httpService
      .patch<Service>(`${environment.apiBaseUrl}/api/service/${id}/`, data)
      .subscribe({
        next: (service) => {
          const current = this.services();
          this.services.set(current.map((s) => (s.id === id ? service : s)));
          this.sending.set(false);
          this.successful.set(true);
          this.selectedService.set(null);
        },
        error: (err) => {
          console.error('Failed to create service:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }

  /**
   * Deletes a service by its ID.
   *
   * This function sends a DELETE request to the server to remove the specified
   * service. It updates the local service list by filtering out the deleted
   * service. It also manages the UI state by setting the sending and successful
   * signals, and resetting the selectedService and formOpen signals.
   *
   * @param id - The ID of the service to be deleted.
   */

  deleteService(id: number) {
    console.log('deleteService', id);
    this.httpService
      .delete(`${environment.apiBaseUrl}/api/service/${id}/`)
      .subscribe({
        next: (service) => {
          const current = this.services();
          this.services.set(current.filter((s) => s.id !== id));
          this.sending.set(false);
          this.successful.set(true);
          this.selectedService.set(null);
        },
        error: (err) => {
          console.error('Failed to create service:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }
}
