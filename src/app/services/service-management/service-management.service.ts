import { inject, Injectable, signal } from '@angular/core';
import { Service, ServiceDto } from '../../models/service.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, tap } from 'rxjs';
import { HttpService } from '../httpclient/http.service';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceManagementService {
  httpService = inject(HttpService);
  services = signal<Service[]>([]);
  selectedService = signal<Service | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  sortServices = (s: Service[]) => s.slice().sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));
  totalPages = signal(1);
  currentPage = signal(1)
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
    this.httpService
      .get<Service[]>(`${environment.apiBaseUrl}/api/services/`)
      .subscribe({
        next: (data) => this.services.set(this.sortServices(data)),
        error: (error) => console.error('Failed to load services', error),
      });
  }

  loadPaginatedService(page: number) {
    this.httpService
      .get<PaginatedResponse<Service>>(`${environment.apiBaseUrl}/api/services/?page=${page}`)
      .subscribe({
        next: (data) => {
          this.services.set(this.sortServices(data.results));
          this.totalPages.set(data.total_pages);
          this.currentPage.set(page);
        },
        error: (error) => {
          console.error('Failed to load services', error);
        },
      });
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
          this.loadPaginatedService(1);
          this.setResponse(false, true, null);
        },
        error: (err) => {
          console.error('Failed to create service:', err);
          this.setResponse(false, false);
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
  updateService( data: ServiceDto) {
    let id = this.selectedService()?.id
    this.sending.set(true);
    this.httpService
      .patch<Service>(`${environment.apiBaseUrl}/api/service/${id}/`, data)
      .subscribe({
        next: (service) => {
          this.loadPaginatedService(1);
          this.setResponse(false, true, null);
        },
        error: (err) => {
          console.error('Failed to create service:', err);
          this.setResponse(false, false);
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
    this.httpService
      .delete(`${environment.apiBaseUrl}/api/service/${id}/`)
      .subscribe({
        next: (service) => {
          this.loadPaginatedService(1);
          this.setResponse(false, true, null);
        },
        error: (err) => {
          console.error('Failed to create service:', err);
          this.setResponse(false, false);
        },
      });
  }

  /**
   * Sets the sending, successful, and selectedService states of the service based
   * on the given parameters.
   *
   * @param sending - A boolean indicating whether the service is currently being
   * sent to the server.
   * @param successful - A boolean indicating whether the service was successfully
   * created, updated, or deleted.
   * @param selected - An optional service object to be set as the selected
   * service. If not provided, the current selected service is not changed.
   */
  setResponse(sending: boolean, successful: boolean, selected?: Service | null) {	
  if (selected) {
    this.selectedService.set(selected);
  }
    this.sending.set(sending);
    this.successful.set(successful);
  }

}
