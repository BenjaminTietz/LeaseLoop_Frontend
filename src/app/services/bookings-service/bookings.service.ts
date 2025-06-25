import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
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
  currentPage = signal(1);
  filterValue = signal<string>('');

  /**
   * Loads all bookings from the API and stores them in the bookings signal
   *
   * @returns {void}
   */
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

  /**
   * Loads paginated bookings from the API and stores them in the bookings signal.
   * Paginates the bookings based on the provided page number and search term.
   * Optionally filters the bookings based on the current filter value.
   * @param page The page of bookings to load.
   * @param searchTerm The search term to search for.
   * @returns {void}
   */
  loadPaginatedBookings(page: number, searchTerm: string = '') {
    this.httpService
      .get<PaginatedResponse<Booking>>(
        `${
          environment.apiBaseUrl
        }/api/bookings/?page=${page}&search=${searchTerm}&filter=${this.filterValue()}`
      )
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

  /**
   * Creates a new booking.
   *
   * Sends a POST request to the API with the provided booking data and adds the
   * newly created booking to the bookings signal upon successful creation.
   * If the request fails, it handles the error appropriately.
   *
   * @param data The booking data to be sent to the API.
   * @returns {void}
   */
  createBooking(data: any) {
    this.sending.set(true);
    this.httpService
      .post<Booking>(`${environment.apiBaseUrl}/api/bookings/`, data)
      .subscribe({
        next: (data) => {
          this.bookings.set([...this.bookings(), data]);
          this.handleSuccess();
        },
        error: (error) => {
          this.handleError('Failed to create Booking');
        },
      });
  }

  /**
   * Updates a booking with the given data.
   *
   * Sends a PATCH request to the API with the provided booking data and
   * updates the bookings signal with the updated booking upon successful
   * update.
   * If the request fails, it handles the error appropriately.
   *
   * @param data The booking data to be sent to the API.
   * @returns {void}
   */
  updateBooking(data: any) {
    this.sending.set(true);
    this.httpService
      .patch(
        `${environment.apiBaseUrl}/api/booking/${this.selectedBooking()?.id}/`,
        data
      )
      .subscribe({
        next: () => {
          this.loadPaginatedBookings(1);
          this.handleSuccess();
        },
        error: (error) => {
          this.handleError('Failed to update Booking');
        },
      });
  }

  /**
   * Deletes the currently selected booking.
   *
   * Sends a DELETE request to the API to delete the booking and reloads the
   * first page of bookings upon successful deletion.
   * If the request fails, it handles the error appropriately.
   *
   * @returns {void}
   */
  deleteBooking() {
    this.sending.set(true);
    this.httpService
      .delete(
        `${environment.apiBaseUrl}/api/booking/${this.selectedBooking()?.id}/`
      )
      .subscribe({
        next: () => {
          this.loadPaginatedBookings(1);
          this.handleSuccess();
        },
        error: (error) => {
          this.handleError('Failed to delete Booking');
        },
      });
  }

  /**
   * Returns a callback function that handles an error by logging the error to the
   * console, setting the `successful` signal to `false` and the `sending` signal to
   * `false`.
   *
   * @param context - The context in which the error occurred, used for logging.
   * @returns {function(any): void} - A callback function that takes an error object
   * as an argument.
   */
  handleError(context: string) {
    return (error: any) => {
      console.error(`${context}:`, error);
      this.successful.set(false);
      this.sending.set(false);
    };
  }

  /**
   * Handles a successful response by setting the `successful` signal to `true` and
   * the `sending` signal to `false`. Called by various methods in the service after
   * a successful server response.
   * @returns {void}
   */

  handleSuccess() {
    this.successful.set(true);
    this.sending.set(false);
  }
}
