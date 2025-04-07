import { Component, inject } from '@angular/core';
import { AvailabilityCalendarComponent } from '../../shared/dashboard-components/availability-calendar/availability-calendar.component';
import { UnitsService } from '../../services/units-service/units.service';
import { DashboardService } from '../../services/dashboard-service/dashboard.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [AvailabilityCalendarComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  unitService = inject(UnitsService);
  dashboardService = inject(DashboardService);
}
