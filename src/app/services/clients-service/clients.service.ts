import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { ClientDto, Clients } from '../../models/clients.model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  clients = signal<Clients[]>([]);
  selectedClient = signal<Clients | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  totalPages = signal(1);
  currentPage = signal(1)

  /** Load all Clients assosiated tothe current user */
  loadClients() {
    this.httpService
      .get<Clients[]>(`${environment.apiBaseUrl}/api/clients/`)
      .subscribe((clients) => {
        this.clients.set(clients);
      });
  }

  loadPaginatedClients(page: number, searchTerm: string = '') {
    this.httpService
      .get<PaginatedResponse<Clients>>(
        `${environment.apiBaseUrl}/api/clients/?page=${page}&search=${searchTerm}`
      )
      .subscribe((clients) => {
        this.clients.set(clients.results);
        this.totalPages.set(clients.total_pages);
        this.currentPage.set(page);
      });
  }



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
