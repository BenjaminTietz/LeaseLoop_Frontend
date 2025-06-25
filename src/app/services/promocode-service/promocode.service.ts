import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { PromoCode, PromoDto } from '../../models/promocode.model';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';
@Injectable({
  providedIn: 'root',
})
export class PromocodeService {
  httpService = inject(HttpService);
  promocodes = signal<PromoCode[]>([]);
  selectedPromocode = signal<PromoCode | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  totalPages = signal(1);
  currentPage = signal(1);
  filterValue = signal<string>('');

  /** Load all promocodes assoziated to current user / property */
  loadPromocodes() {
    this.httpService
      .get<PromoCode[]>(`${environment.apiBaseUrl}/api/promocodes/`)
      .subscribe({
        next: (data) => this.promocodes.set(data),
        error: (error) => console.error('Failed to load promocodes', error),
      });
  }

  /**
   * Loads paginated promocodes from the API.
   * @param page The page of promocodes to load.
   * @param searchTerm Optional search term to filter the promocodes by.
   */
  loadPaginatedPromoCodes(page: number, searchTerm: string = '') {
    this.sending.set(true);
    this.httpService
      .get<PaginatedResponse<PromoCode>>(
        `${
          environment.apiBaseUrl
        }/api/promocodes/?page=${page}&search=${searchTerm}&filter=${this.filterValue()}`
      )
      .subscribe({
        next: (data) => {
          this.promocodes.set(data.results);
          this.totalPages.set(data.total_pages);
          this.currentPage.set(page);
          this.sending.set(false);
        },
        error: (error) => {
          console.error('Failed to load promocodes', error);
        },
      });
  }

  /**
   * Deletes a promocode by its id and updates the promocodes signal.
   * Sets the selectedPromocode signal to null and the successful signal to true on success.
   * Sets the successful signal to false on error.
   * @param id The id of the promocode to delete.
   */
  deleteService(id: number) {
    this.httpService
      .delete(`${environment.apiBaseUrl}/api/promocode/${id}/`)
      .subscribe({
        next: () => {
          const current = this.promocodes();
          this.promocodes.set(current.filter((promo) => promo.id !== id));
          this.selectedPromocode.set(null);
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
   * Creates a new promo code using the given data.
   * Calls the `loadPaginatedPromoCodes` method with the first page as argument on success.
   * Sets the `sending` signal to false and the `successful` signal to true on success.
   * Sets the `sending` signal to false and the `successful` signal to false on error.
   * @param data The data to create a new promocode.
   */
  createPromocode(data: PromoDto) {
    this.sending.set(true);
    this.httpService
      .post<PromoCode>(`${environment.apiBaseUrl}/api/promocodes/`, data)
      .subscribe({
        next: (service) => {
          this.loadPaginatedPromoCodes(1);
        },
        error: (err) => {
          console.error('Failed to create promocode:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }

  /**
   * Updates an existing promo code with the given data.
   * Sends a PATCH request to the server with the promo code ID obtained from the selectedPromocode signal.
   * On success, it reloads the first page of paginated promo codes and sets the sending signal to false.
   * If the request fails, it logs an error and sets the sending and successful signals to false.
   * @param data The data to update the promocode.
   */
  updatePromocode(data: PromoDto) {
    this.sending.set(true);
    this.httpService
      .patch<PromoCode>(
        `${environment.apiBaseUrl}/api/promocode/${
          this.selectedPromocode()?.id
        }/`,
        data
      )
      .subscribe({
        next: (service) => {
          this.loadPaginatedPromoCodes(1);
        },
        error: (err) => {
          console.error('Failed to create promocode:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }
}
