import { effect, inject, Injectable, OnInit, signal } from '@angular/core';
import { DashboardStats } from '../../models/dashboard-stats.model';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { Booking } from '../../models/booking.model';
import {
  disableBackgroundScroll,
  enableBackgroundScroll,
} from '../../utils/scroll.utils';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements OnInit {
  httpService = inject(HttpService);
  dashboardStats = signal<DashboardStats | null>(null);
  isbookingPopupOpen = signal(false);
  showBooking = signal<Booking | null>(null);

  /**
   * ngOnInit Lifecycle hook
   *
   * Retrieve the dashboard stats on component initialization
   */
  ngOnInit(): void {
    this.getDashboardStats();
  }
  /**
   * Constructor
   *
   * Disable/enable background scroll depending on booking popup state
   */

  constructor() {
    effect(() => {
      if (this.isbookingPopupOpen()) {
        disableBackgroundScroll();
      } else {
        enableBackgroundScroll();
      }
    });
  }

  /**
   * Retrieve the dashboard statistics from the server and update the `dashboardStats` signal
   *
   * The dashboard statistics are retrieved from the server on component initialization.
   * The `dashboardStats` signal is updated with the retrieved data.
   *
   * The request is made to the `/api/dashboard-stats/` endpoint.
   * The response is expected to be in the `DashboardStats` format.
   *
   * If the request fails, an error is logged to the console.
   */
  getDashboardStats() {
    this.httpService
      .get<DashboardStats>(`${environment.apiBaseUrl}/api/dashboard-stats/`)
      .subscribe({
        next: (data) => this.dashboardStats.set(data),
        error: (error) => console.error('Failed to load properties', error),
      });
  }
}
