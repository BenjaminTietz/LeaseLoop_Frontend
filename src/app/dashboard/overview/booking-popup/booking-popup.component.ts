import { Component, inject } from '@angular/core';
import { DashboardService } from '../../../services/dashboard-service/dashboard.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-booking-popup',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './booking-popup.component.html',
  styleUrl: './booking-popup.component.scss',
})
export class BookingPopupComponent {
  dashboardService = inject(DashboardService);
}
