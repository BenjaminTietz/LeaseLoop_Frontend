import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
import { Booking } from '../../models/booking.model';
@Injectable({
  providedIn: 'root',
})
export class BookingsService {
  httpService = inject(HttpService);

  // Signals to hold reactive state
  bookings = signal<Booking[]>([]);

  /** Load all Booking assoziated to current user / property */
  loadBooking() {
    this.httpService
      .get<Booking[]>(`${environment.apiBaseUrl}/api/bookings/`)
      .subscribe({
        next: (data) => this.bookings.set(data),
        error: (error) => console.error('Failed to load bookings', error),
      });
  }

  /** Load a single Booking by its ID */
  getBooking(id: number) {
    return this.httpService.get<Booking>(
      `${environment.apiBaseUrl}/api/booking/${id}/`
    );
  }

  /** Create a new Booking */
  createBooking(data: Partial<Booking>) {
    return this.httpService.post<Booking>(
      `${environment.apiBaseUrl}/api/booking/`,
      data
    );
  }

  /** Update an existing Booking */
  updateBooking(id: number, data: Partial<Booking>) {
    return this.httpService.patch<Booking>(
      `${environment.apiBaseUrl}/api/booking/${id}/`,
      data
    );
  }

  /** Delete a Booking */
  deleteBooking(id: number) {
    return this.httpService.delete(
      `${environment.apiBaseUrl}/api/booking/${id}/`
    );
  }
}
