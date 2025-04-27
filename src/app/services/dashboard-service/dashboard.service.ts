import { effect, inject, Injectable, OnInit, signal } from '@angular/core';
import { DashboardStats } from '../../models/dashboard-stats.model';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { Booking } from '../../models/booking.model';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../utils/scroll.utils';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements OnInit {
  httpService = inject(HttpService);
  dashboardStats = signal<DashboardStats | null>(null);
  isbookingPopupOpen = signal(false);
  showBooking = signal<Booking | null>(null);
  ngOnInit(): void {
    this.getDashboardStats();
  }
  constructor() {
    effect(() => {
      if(this.isbookingPopupOpen()){
        disableBackgroundScroll()
      }else{
        enableBackgroundScroll()
      }
    });
  }

  getDashboardStats() {
    this.httpService
      .get<DashboardStats>(`${environment.apiBaseUrl}/api/dashboard-stats/`)
      .subscribe({
        next: (data) => this.dashboardStats.set(data),
        error: (error) => console.error('Failed to load properties', error),
      });
  }
}
