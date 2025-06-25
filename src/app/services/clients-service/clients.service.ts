import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { ClientDto, Clients } from '../../models/clients.model';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  httpService = inject(HttpService);

  clients = signal<Clients[]>([]);
  selectedClient = signal<Clients | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  totalPages = signal(1);
  currentPage = signal(1);
  filterValue = signal('');

  /** Load all Clients assosiated tothe current user */
  loadClients() {
    this.httpService
      .get<Clients[]>(`${environment.apiBaseUrl}/api/clients/`)
      .subscribe((clients) => {
        this.clients.set(clients);
      });
  }

  /**
   * Loads a paginated list of clients, filtered by the provided search term and filter criteria.
   *
   * The method updates the `clients` signal with the paginated list of clients, and
   * the `totalPages` signal with the total number of pages available.
   *
   * @param page The page number of clients to load.
   * @param searchTerm The search term to filter clients by.
   */
  loadPaginatedClients(page: number, searchTerm: string = '') {
    this.httpService
      .get<PaginatedResponse<Clients>>(
        `${
          environment.apiBaseUrl
        }/api/clients/?page=${page}&search=${searchTerm}&filter=${this.filterValue()}`
      )
      .subscribe((clients) => {
        this.clients.set(clients.results);
        this.totalPages.set(clients.total_pages);
        this.currentPage.set(page);
      });
  }

  /**
   * Deletes a client by ID.
   *
   * Updates the `clients` signal to remove the deleted client, and
   * sets the `selectedClient` signal to `null`.
   *
   * @param id The ID of the client to delete
   */
  deleteClient(id: number) {
    this.httpService
      .delete(`${environment.apiBaseUrl}/api/client/${id}/`)
      .subscribe({
        next: () => {
          const current = this.clients();
          this.clients.set(current.filter((promo) => promo.id !== id));
          this.selectedClient.set(null);
          this.sending.set(false);
          this.successful.set(true);
        },
        error: (err) => {
          console.error('Failed to delete promocode:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }

  /**
   * Creates a new client with the given data.
   *
   * This function sends a POST request to the server to create the specified
   * client. It adds the new client to the local client list. It also manages
   * the UI state by setting the sending and successful signals, and resetting
   * the selectedClient and formOpen signals.
   *
   * @param data - The data to be used to create the new client.
   */
  createClient(data: ClientDto) {
    this.sending.set(true);
    this.httpService
      .post<Clients>(`${environment.apiBaseUrl}/api/clients/`, data)
      .subscribe({
        next: (service) => {
          const current = this.clients();
          this.clients.set([...current, service]);
          this.sending.set(false);
          this.successful.set(true);
          this.selectedClient.set(null);
        },
        error: (err) => {
          console.error('Failed to create Client:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }

  /**
   * Updates an existing client with the given data.
   *
   * This function sends a PATCH request to the server to update the specified
   * client. It updates the local client list by replacing the existing client
   * with the updated one. It also manages the UI state by setting the sending
   * and successful signals, and resetting the selectedClient signal.
   *
   * @param data - The data to be used for the update.
   */

  updateClient(data: ClientDto) {
    this.sending.set(true);
    this.httpService
      .patch<Clients>(
        `${environment.apiBaseUrl}/api/client/${this.selectedClient()?.id}/`,
        data
      )
      .subscribe({
        next: (service) => {
          const current = this.clients();
          this.clients.set(
            current.map((s) => (s.id === service.id ? service : s))
          );
          this.sending.set(false);
          this.successful.set(true);
          this.selectedClient.set(null);
        },
        error: (err) => {
          console.error('Failed to create client:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }
}
