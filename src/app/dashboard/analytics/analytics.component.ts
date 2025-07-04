import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../services/analytics-service/analytics.service';
import { BookingChartComponent } from './charts/booking-chart/booking-chart.component';
import { ServiceChartComponent } from './charts/service-chart/service-chart.component';
import { RevenueChartComponent } from './charts/revenue-chart/revenue-chart.component';
import { SelectorComponent } from './charts/selector/selector.component';
import { CancelledBookingsComponent } from './charts/cancelled-bookings/cancelled-bookings.component';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';
import { NoDataComponent } from '../../shared/global/no-data/no-data.component';
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    BookingChartComponent,
    ServiceChartComponent,
    RevenueChartComponent,
    SelectorComponent,
    CancelledBookingsComponent,
    SelectorComponent,
    ProgressBarComponent,
    NoDataComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  public analyticsService = inject(AnalyticsService);

  /**
   * Set the default date range for the analytics component when it initializes.
   * This is the only lifecycle hook that is used in this component.
   */
  ngOnInit(): void {
    this.analyticsService.setDefaultDateRange();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
