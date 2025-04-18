import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import {
  RevenueStats,
  ServiceStats,
  PropertyBookingStats,
} from '../../models/analytics.models';
import { subDays, subWeeks, subMonths, subYears, format } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private http = inject(HttpService);
  revenueData = signal<RevenueStats[]>([]);
  serviceData = signal<ServiceStats[]>([]);
  bookingData = signal<PropertyBookingStats[]>([]);

  dateFrom = signal<string>('2025-01-01');
  dateTo = signal<string>('2025-12-31');
  selectedPeriod = signal<'day' | 'week' | 'month' | 'year'>('month');

  selectedProperty = signal<string>('all');
  selectedUnit = signal<string>('all');

  constructor() {
    effect(
      () => {
        const period = this.selectedPeriod();

        const today = new Date();
        let from: Date;

        switch (period) {
          case 'day':
            from = subDays(today, 1);
            break;
          case 'week':
            from = subWeeks(today, 1);
            break;
          case 'month':
            from = subMonths(today, 1);
            break;
          case 'year':
            from = subYears(today, 1);
            break;
          default:
            from = subMonths(today, 1);
        }

        this.dateFrom.set(format(from, 'yyyy-MM-dd'));
        this.dateTo.set(format(today, 'yyyy-MM-dd'));

        console.log(
          'Date range updated:',
          this.dateFrom(),
          this.dateTo(),
          this.selectedPeriod()
        );
      },
      { allowSignalWrites: true }
    );
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
    this.http.get<PropertyBookingStats[]>(url).subscribe({
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
    // TODO: Uncomment the following lines if you want to filter by property and unit decide if we need to filter by property and unit
    // if (property !== 'all') {
    //   params.append('property', property);
    // }
    // if (unit !== 'all') {
    //   params.append('unit', unit);
    // }

    return `${base}?${params.toString()}`;
  }
}
