import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';
import { Booking } from '../../models/booking.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
@Injectable({
  providedIn: 'root',
})
export class BookingsService {
  httpService = inject(HttpService);
  selectedBooking = signal<Booking | null>(null);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  bookings = signal<Booking[]>([]);
  totalPages = signal(1);
  currentPage = signal(1)

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

  loadPaginatedBookings(page: number) {
    this.httpService
      .get<PaginatedResponse<Booking>>(`${environment.apiBaseUrl}/api/bookings/?page=${page}`)
      .subscribe({
        next: (data) => {
          this.bookings.set(data.results);
          this.totalPages.set(data.total_pages);
          this.currentPage.set(page);
        },
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
          this.loadPaginatedBookings(1)
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
          this.loadPaginatedBookings(1)
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
