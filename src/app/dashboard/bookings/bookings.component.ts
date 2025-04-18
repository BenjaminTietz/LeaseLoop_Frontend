import { Component, inject, OnInit, signal } from '@angular/core';
import { BookingsService } from '../../services/bookings-service/bookings.service';
import { BookingPopupComponent } from '../overview/booking-popup/booking-popup.component';
import { DashboardService } from '../../services/dashboard-service/dashboard.service';
import { MatIcon } from '@angular/material/icon';
import { BookingFormComponent } from "./booking-form/booking-form.component";
import { Booking } from '../../models/booking.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [BookingPopupComponent, MatIcon, BookingFormComponent, CommonModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  bs = inject(BookingsService);
  dashboardService = inject(DashboardService);

  formOpen = signal(false);

  ngOnInit() {
    this.bs.loadBooking();
  }

  openForm(booking: Booking | null = null) {
    this.formOpen.set(true);
    this.bs.selectedBooking.set(null);
    if(booking) this.bs.selectedBooking.set(booking);
  }

  closeForm() {
    this.formOpen.set(false);
  }
}
