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
  bookings = signal<Booking[]>([]);

  loadBooking() {
    this.sending.set(true);
    this.httpService
      .get<Booking[]>(`${environment.apiBaseUrl}/api/bookings/`)
      .subscribe({
        next: (data) => this.bookings.set(data),
        error: (error) => {
          this.handleError('Failed to load Bookings');
        },
      });
  }

  createBooking(data:any) {
    this.sending.set(true);
    this.httpService
      .post<Booking>(`${environment.apiBaseUrl}/api/bookings/`, data)
      .subscribe({
        next: (data) =>{ 
          this.bookings.set([...this.bookings(), data])
          this.handleSuccess()
        },
        error: (error) => {
          this.handleError('Failed to create Booking');
        }
      });
  }

  updateBooking( data:any) {
  this.sending.set(true);
   this.httpService
      .patch(`${environment.apiBaseUrl}/api/booking/${this.selectedBooking()?.id}/`, data)
      .subscribe({
        next: () =>{ 
          this.loadBooking();
          this.handleSuccess()
         },
        error: (error) =>{
          this.handleError('Failed to update Booking');
        }
      });
  }

  deleteBooking() {
    this.sending.set(true);
    this.httpService
      .delete(`${environment.apiBaseUrl}/api/booking/${this.selectedBooking()?.id}/`)
      .subscribe({
        next: () => {
          this.loadBooking();
          this.handleSuccess()	
        },
        error: (error) => {
          this.handleError('Failed to delete Booking');
        }
      });
  }

  handleError(context: string) {
    return (error: any) => {
      console.error(`${context}:`, error);
      this.successful.set(false);
      this.sending.set(false);
    }
  }

  handleSuccess() {
      this.successful.set(true);
      this.sending.set(false)
  }
}
