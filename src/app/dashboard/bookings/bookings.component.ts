import { Component, inject, OnInit } from '@angular/core';
import { BookingsService } from '../../services/bookings-service/bookings.service';
import { BookingPopupComponent } from '../overview/booking-popup/booking-popup.component';
import { DashboardService } from '../../services/dashboard-service/dashboard.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [BookingPopupComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  bs = inject(BookingsService);
  dashboardService = inject(DashboardService);

  ngOnInit() {
    this.bs.loadBooking();
  }
}
