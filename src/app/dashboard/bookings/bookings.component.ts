import { Component, inject, OnInit, signal } from '@angular/core';
import { BookingsService } from '../../services/bookings-service/bookings.service';
import { BookingPopupComponent } from '../overview/booking-popup/booking-popup.component';
import { DashboardService } from '../../services/dashboard-service/dashboard.service';
import { MatIcon } from '@angular/material/icon';
import { BookingFormComponent } from "./booking-form/booking-form.component";
import { Booking } from '../../models/booking.model';
import { CommonModule } from '@angular/common';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";
import { FilterComponent } from "../../shared/global/filter/filter.component";

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [BookingPopupComponent, MatIcon, BookingFormComponent, CommonModule, PagingComponent, SearchInputComponent, FilterComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  bs = inject(BookingsService);
  dashboardService = inject(DashboardService);
  filterBy = [
  { label: 'Client Name 🔼', value: 'client_name' },
  { label: 'Client Name 🔽', value: 'descending_client_name' },
  { label: 'Total Price 🔼', value: 'ascending_total_price' },
  { label: 'Total Price 🔽', value: 'descending_total_price' },
  { label: 'Status', value: 'status' },
  { label: 'Guests 🔼', value: 'least_guests' },
  { label: 'Guests 🔽', value: 'most_guests' },
  { label: 'Arrival Date 📅', value: 'arrival_date' },
  { label: 'Departure Date 📅', value: 'departure_date' }
  ];

  formOpen = signal(false);
  searchInput = signal('');

  ngOnInit() {
    this.bs.loadPaginatedBookings(1);
    setTimeout(() => {
      console.log(this.bs.bookings());
      
    }, 3000);
  }

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.bs.loadPaginatedBookings(1, searchTerm);
  }

  openForm() {
    this.formOpen.set(true);
    this.bs.selectedBooking.set(null);
    this.bs.successful.set(false);
  }

  closeForm() {
    this.formOpen.set(false);
    this.bs.loadPaginatedBookings(this.bs.currentPage(), this.searchInput());
  }

  openEditForm(booking: Booking) {
    this.formOpen.set(true);
    this.bs.selectedBooking.set(booking);
    this.bs.successful.set(false);
  }

  filterBookings(filter: string) {
    this.bs.filterValue.set(filter);
    this.bs.loadPaginatedBookings(1, this.searchInput());
  }
}
