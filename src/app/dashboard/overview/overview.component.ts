import { Component } from '@angular/core';
import { AvailabilityCalendarComponent } from '../../shared/dashboard-components/availability-calendar/availability-calendar.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [AvailabilityCalendarComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {}
