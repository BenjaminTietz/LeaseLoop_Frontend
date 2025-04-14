import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { PromoCode, PromoDto } from '../../models/promocode.model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PromocodeService {
  httpService = inject(HttpService);
  promocodes = signal<PromoCode[]>([]);
  selectedPromocode = signal<PromoCode | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);

  /** Load all promocodes assoziated to current user / property */
  loadPromocodes() {
     this.httpService
      .get<PromoCode[]>(`${environment.apiBaseUrl}/api/promocodes/`)
      .subscribe({
        next: (data) => this.promocodes.set(data),
        error: (error) => console.error('Failed to load promocodes', error),
      });
  }

  deleteService(id: number) {
    console.log('deleteService', id);
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
          const current = this.promocodes();
          this.promocodes.set([...current, service]);

          this.sending.set(false);
          this.successful.set(true);
          this.selectedPromocode.set(null);
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
          const current = this.promocodes();
          this.promocodes.set(
            current.map((s) => (s.id === service.id ? service : s))
          );
          this.sending.set(false);
          this.successful.set(true);
          this.selectedPromocode.set(null);
        },
        error: (err) => {
          console.error('Failed to create promocode:', err);
          this.sending.set(false);
          this.successful.set(false);
        },
      });
  }
}
