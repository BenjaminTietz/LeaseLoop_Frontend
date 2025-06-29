import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import {
  ServiceStats,
  PropertyBookingStats,
} from '../../models/analytics.models';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private http = inject(HttpService);
  revenueData = signal<any[]>([]);
  revenueGroupedData = signal<{ name: string; revenue: number }[]>([]);
  serviceData = signal<ServiceStats[]>([]);
  bookingData = signal<PropertyBookingStats[]>([]);
  cancelledBookingsData = signal<any>(null);
  sending = signal<boolean>(false);
  dateFrom = signal<string>('');
  dateTo = signal<string>('');

  /**
   * Updates all analytics data by calling all the respective methods
   * @param from start date of the period
   * @param to end date of the period
   */
  public updateAllAnalytics(from: string, to: string) {
    this.getBookingData(from, to);
    this.getServiceData(from, to);
    this.getRevenueGroupedData(from, to);
    this.getCancelledBookingsData(from, to);
  }

  /**
   * Fetches revenue data grouped by category for a given period and updates the revenueGroupedData signal.
   * Initiates an HTTP GET request to the '/api/analytics/revenue-by/' endpoint with the provided date range.
   * If data is retrieved successfully, it maps the result to an array of objects containing 'name' and 'revenue' fields.
   * Updates the revenueGroupedData signal with the mapped data. If an error occurs or no data is returned,
   * the revenueGroupedData signal is set to an empty array.
   * @param from - The start date of the period in 'YYYY-MM-DD' format.
   * @param to - The end date of the period in 'YYYY-MM-DD' format.
   */
  public getRevenueGroupedData(from: string, to: string) {
    this.sending.set(true);
    const url = this.buildUrl('/api/analytics/revenue-by/', from, to);
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        if (!Array.isArray(data) || data.length === 0) {
          this.revenueGroupedData.set([]);
          this.sending.set(false);
          return;
        }
        const mapped = data.map((item) => ({
          name: item.name ?? 'Unknown',
          revenue: item.revenue ?? 0,
        }));
        this.revenueGroupedData.set(mapped);
      },
      error: (err) => {
        this.sending.set(false);
        console.error('Error fetching grouped revenue data:', err);
      },
    });
  }

  /**
   * Fetches booking data for a given period and updates the bookingData signal with the result.
   * Initiates an HTTP GET request to the '/api/analytics/bookings/' endpoint using the provided date range.
   * If the data is retrieved successfully, it updates the bookingData signal with the received data.
   * If an error occurs during the request, an error message is logged, and the sending signal is set to false.
   * @param from - The start date of the period in 'YYYY-MM-DD' format.
   * @param to - The end date of the period in 'YYYY-MM-DD' format.
   */
  public getBookingData(from: string, to: string) {
    this.sending.set(true);
    const url = this.buildUrl('/api/analytics/bookings/', from, to);
    this.http.get<PropertyBookingStats[]>(url).subscribe({
      next: (data) => {
        this.bookingData.set(data), this.sending.set(false);
      },
      error: (err) => {
        console.error('Error fetching booking data:', err),
          this.sending.set(false);
      },
    });
  }

  /**
   * Fetches service data for a given period and updates the serviceData signal with the result.
   * Initiates an HTTP GET request to the '/api/analytics/services/' endpoint using the provided date range.
   * If the data is retrieved successfully, it updates the serviceData signal with the received data.
   * If an error occurs during the request, an error message is logged, and the sending signal is set to false.
   * @param from - The start date of the period in 'YYYY-MM-DD' format.
   * @param to - The end date of the period in 'YYYY-MM-DD' format.
   */
  public getServiceData(from: string, to: string) {
    this.sending.set(true);
    const url = this.buildUrl('/api/analytics/services/', from, to);
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.serviceData.set(data), this.sending.set(false);
      },
      error: (err) => {
        console.error('Error fetching service data:', err),
          this.sending.set(false);
      },
    });
  }

  /**
   * Builds a URL by concatenating the given endpoint with the environment's API base URL
   * and appending the given from and to dates as query parameters.
   * @param endpoint the API endpoint to call
   * @param from the start date of the period in 'YYYY-MM-DD' format
   * @param to the end date of the period in 'YYYY-MM-DD' format
   * @returns the built URL
   */
  public buildUrl(endpoint: string, from: string, to: string): string {
    const base = `${environment.apiBaseUrl}${endpoint}`;
    const params = new URLSearchParams({ from, to });
    return `${base}?${params.toString()}`;
  }

  /**
   * Fetches cancelled bookings data for a given period and updates the cancelledBookingsData signal with the result.
   * Initiates an HTTP GET request to the '/api/analytics/cancelled-bookings/' endpoint using the provided date range.
   * If the data is retrieved successfully, it updates the cancelledBookingsData signal with the received data.
   * If an error occurs during the request, an error message is logged.
   * @param from - The start date of the period in 'YYYY-MM-DD' format.
   * @param to - The end date of the period in 'YYYY-MM-DD' format.
   */
  public getCancelledBookingsData(from: string, to: string) {
    const url = this.buildUrl('/api/analytics/cancelled-bookings/', from, to);
    this.http.get<any>(url).subscribe({
      next: (data) => this.cancelledBookingsData.set(data),
      error: (err) =>
        console.error('Error fetching cancelled bookings data:', err),
    });
  }

  /**
   * Sets the default date range for analytics to the current year,
   * with dateFrom as January 1st and dateTo as today.
   * Also triggers updateAllAnalytics with the new range.
   */
  public setDefaultDateRange() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const from = `${currentYear}-01-01`;
    const to = today.toISOString().split('T')[0];
    this.dateFrom.set(from);
    this.dateTo.set(to);
    this.updateAllAnalytics(from, to);
  }
}
