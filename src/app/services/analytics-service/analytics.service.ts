import { effect, inject, Injectable, signal } from '@angular/core';
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
  dateFrom = signal<string>('2023-01-01');
  dateTo = signal<string>('2026-12-31');
  selectedPeriod = signal<'day' | 'week' | 'month' | 'year'>('month');

  public updateAllAnalytics(from: string, to: string) {
    this.getRevenueData(from, to);
    this.getBookingData(from, to);
    this.getServiceData(from, to);
    this.getRevenueGroupedData(from, to);
    this.getCancelledBookingsData(from, to);
  }

  public getRevenueData(from: string, to: string): void {
    this.sending.set(true);
    const url = this.buildUrl('/api/analytics/revenue/', from, to);
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.revenueData.set(data ?? []), this.sending.set(false);
      },
      error: (err) => {
        console.error('Error fetching revenue data:', err);
        this.sending.set(false);
      },
    });
  }

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

  public buildUrl(endpoint: string, from: string, to: string): string {
    const base = `${environment.apiBaseUrl}${endpoint}`;
    const params = new URLSearchParams({ from, to });
    return `${base}?${params.toString()}`;
  }

  public getCancelledBookingsData(from: string, to: string) {
    const url = this.buildUrl('/api/analytics/cancelled-bookings/', from, to);
    this.http.get<any>(url).subscribe({
      next: (data) => this.cancelledBookingsData.set(data),
      error: (err) =>
        console.error('Error fetching cancelled bookings data:', err),
    });
  }
}
