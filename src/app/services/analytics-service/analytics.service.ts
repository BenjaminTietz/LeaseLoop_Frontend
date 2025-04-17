import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import {
  RevenueStats,
  BookingStats,
  ServiceStats,
} from '../../models/analytics.models';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private http = inject(HttpService);
  revenueData = signal<RevenueStats[]>([]);
  serviceData = signal<ServiceStats[]>([]);
  bookingData = signal<BookingStats[]>([]);

  dateFrom = signal<string>('2025-01-01');
  dateTo = signal<string>('2025-03-31');
  selectedProperty = signal<string>('all');
  selectedUnit = signal<string>('all');

  constructor() {
    effect(() => {
      const from = this.dateFrom();
      const to = this.dateTo();
      const property = this.selectedProperty();
      const unit = this.selectedUnit();

      this.updateAllAnalytics(from, to, property, unit);
    });
  }

  public updateAllAnalytics(
    from: string,
    to: string,
    property: string,
    unit: string
  ) {
    this.getRevenueData(from, to, property, unit);
    this.getBookingData(from, to, property, unit);
    this.getServiceData(from, to, property, unit);
    console.log('Analytics updated:', { from, to, property, unit });
  }

  public getRevenueData(
    from: string,
    to: string,
    property: string,
    unit: string
  ): void {
    const url = this.buildUrl(
      '/api/analytics/revenue/',
      from,
      to,
      property,
      unit
    );
    this.http.get<RevenueStats[]>(url).subscribe({
      next: (data) => this.revenueData.set(data ?? []),
      error: (err) => console.error('Error fetching revenue data:', err),
    });
  }

  public getBookingData(
    from: string,
    to: string,
    property: string,
    unit: string
  ) {
    const url = this.buildUrl(
      '/api/analytics/bookings/',
      from,
      to,
      property,
      unit
    );
    this.http.get<any[]>(url).subscribe({
      next: (data) => this.bookingData.set(data),
      error: (err) => console.error('Error fetching booking data:', err),
    });
  }

  public getServiceData(
    from: string,
    to: string,
    property: string,
    unit: string
  ) {
    const url = this.buildUrl(
      '/api/analytics/services/',
      from,
      to,
      property,
      unit
    );
    this.http.get<any[]>(url).subscribe({
      next: (data) => this.serviceData.set(data),
      error: (err) => console.error('Error fetching service data:', err),
    });
  }

  public buildUrl(
    endpoint: string,
    from: string,
    to: string,
    property: string,
    unit: string
  ): string {
    const base = `${environment.apiBaseUrl}${endpoint}`;
    const params = new URLSearchParams({ from, to });

    if (property !== 'all') {
      params.append('property', property);
    }
    if (unit !== 'all') {
      params.append('unit', unit);
    }

    return `${base}?${params.toString()}`;
  }
}
