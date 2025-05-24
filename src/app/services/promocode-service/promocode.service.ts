import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { PromoCode, PromoDto } from '../../models/promocode.model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
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

  /** Load all promocodes assoziated to current user / property */
  loadPromocodes() {
     this.httpService
      .get<PromoCode[]>(`${environment.apiBaseUrl}/api/promocodes/`)
      .subscribe({
        next: (data) => this.promocodes.set(data),
        error: (error) => console.error('Failed to load promocodes', error),
      });
  }

  loadPaginatedPromoCodes(page:number){
    this.sending.set(true);
    this.httpService
      .get<PaginatedResponse<PromoCode>>(`${environment.apiBaseUrl}/api/promocodes/?page=${page}`)
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

  createPromocode(data: PromoDto) {
    this.sending.set(true);
    this.httpService
      .post<PromoCode>(`${environment.apiBaseUrl}/api/promocodes/`, data)
      .subscribe({
        next: (service) => {
          this.loadPaginatedPromoCodes(1)
        },
        error: (err) => {
          console.error('Failed to create promocode:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }

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
          this.loadPaginatedPromoCodes(1)
        },
        error: (err) => {
          console.error('Failed to create promocode:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }
}
