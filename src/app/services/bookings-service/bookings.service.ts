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
  selectedBooking = signal<Booking | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);

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
  createBooking(data:any) {
    this.httpService
      .post<Booking>(`${environment.apiBaseUrl}/api/bookings/`, data)
      .subscribe({
        next: (data) => this.bookings.set([...this.bookings(), data]),
        error: (error) => console.error('Failed to create Booking', error),
      });
  }

  /** Update an existing Booking */
  updateBooking( data:any) {
    console.log(data);
   this.httpService
      .patch(`${environment.apiBaseUrl}/api/booking/${this.selectedBooking()?.id}/`, data)
      .subscribe({
        next: () =>{ this.loadBooking() },
        error: (error) => console.error('Failed to update Booking', error),
      });
  }

  /** Delete a Booking */
  deleteBooking() {
    this.httpService
      .delete(`${environment.apiBaseUrl}/api/booking/${this.selectedBooking()?.id}/`)
      .subscribe({
        next: () => this.loadBooking(),
        error: (error) => console.error('Failed to delete Booking', error),
      });
  }
}
