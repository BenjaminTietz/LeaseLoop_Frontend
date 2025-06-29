import { Component, inject, OnInit } from '@angular/core';
import { AvailabilityCalendarComponent } from '../../shared/dashboard-components/availability-calendar/availability-calendar.component';
import { UnitsService } from '../../services/units-service/units.service';
import { DashboardService } from '../../services/dashboard-service/dashboard.service';
import { BookingPopupComponent } from './booking-popup/booking-popup.component';
import { NoDataComponent } from '../../shared/global/no-data/no-data.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    AvailabilityCalendarComponent,
    BookingPopupComponent,
    NoDataComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  unitService = inject(UnitsService);
  dashboardService = inject(DashboardService);

  /**
   * ngOnInit Lifecycle hook
   *
   * Retrieve the dashboard stats on component initialization
   */
  ngOnInit(): void {
    this.dashboardService.getDashboardStats();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}
