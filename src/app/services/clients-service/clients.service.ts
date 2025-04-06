import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Clients } from '../../models/clients.model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  clients = signal<Clients[]>([]);

  /** Load all Clients assosiated tothe current user */
  loadClients() {
    return this.httpService
      .get<Clients[]>(`${environment.apiBaseUrl}/api/clients/`)
      .pipe(
        tap((data) => this.clients.set(data)),
        catchError((error) => {
          console.error('Failed to load clients', error);
          return throwError(() => error);
        })
      );
  }

  /** Load a single Client by its ID */
  getClient(id: number) {
    return this.httpService.get<Clients>(
      `${environment.apiBaseUrl}/api/clients/${id}/`
    );
  }

  /** Create a new Client */
  createClient(data: Partial<Clients>) {
    return this.httpService.post<Clients>(
      `${environment.apiBaseUrl}/api/clients/`,
      data
    );
  }

  /** Update an existing Client */
  updateClient(id: number, data: Partial<Clients>) {
    return this.httpService.patch<Clients>(
      `${environment.apiBaseUrl}/api/clients/${id}/`,
      data
    );
  }

  /** Delete a Client */
  deleteClient(id: number) {
    return this.httpService.delete(
      `${environment.apiBaseUrl}/api/clients/${id}/`
    );
  }
}
