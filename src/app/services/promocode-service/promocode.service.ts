import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { PromoCode } from '../../models/promocode.model';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PromocodeService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  promocodes = signal<PromoCode[]>([]);

  /** Load all promocodes assoziated to current user / property */
  loadPromocodes() {
    return this.httpService
      .get<PromoCode[]>(`${environment.apiBaseUrl}/api/promocodes/`)
      .pipe(
        tap((data) => this.promocodes.set(data)),
        catchError((error) => {
          console.error('Failed to load promocodes', error);
          return throwError(() => error);
        })
      );
  }

  /** Load a single promocode by its ID */
  getPromocode(id: number) {
    return this.httpService.get<PromoCode>(
      `${environment.apiBaseUrl}/api/promocode/${id}/`
    );
  }

  /** Create a new promocode */
  createPromocode(data: Partial<PromoCode>) {
    return this.httpService.post<PromoCode>(
      `${environment.apiBaseUrl}/api/promocodes/`,
      data
    );
  }

  /** Update an existing promocode */
  updatePromocode(id: number, data: Partial<PromoCode>) {
    return this.httpService.patch<PromoCode>(
      `${environment.apiBaseUrl}/api/promocode/${id}/`,
      data
    );
  }

  /** Delete a promocode */
  deletePromocodes(id: number) {
    return this.httpService.delete(
      `${environment.apiBaseUrl}/api/promocode/${id}/`
    );
  }
}
