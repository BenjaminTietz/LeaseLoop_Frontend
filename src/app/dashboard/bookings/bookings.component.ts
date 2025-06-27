import { Component, inject, OnInit, signal } from '@angular/core';
import { BookingsService } from '../../services/bookings-service/bookings.service';
import { BookingPopupComponent } from '../overview/booking-popup/booking-popup.component';
import { DashboardService } from '../../services/dashboard-service/dashboard.service';
import { MatIcon } from '@angular/material/icon';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { Booking } from '../../models/booking.model';
import { CommonModule } from '@angular/common';
import { PagingComponent } from '../../shared/dashboard-components/paging/paging.component';
import { SearchInputComponent } from '../../shared/dashboard-components/search-input/search-input.component';
import { FilterComponent } from '../../shared/global/filter/filter.component';
import { HorizontalDirectivesDirective } from '../../directives/horizontal-scroll/horizontal-directives.directive';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    BookingPopupComponent,
    MatIcon,
    BookingFormComponent,
    CommonModule,
    PagingComponent,
    SearchInputComponent,
    FilterComponent,
    HorizontalDirectivesDirective
  ],
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
    { label: 'Departure Date 📅', value: 'departure_date' },
  ];

  formOpen = signal(false);
  searchInput = signal('');

  /**
   * Initializes the component by loading the first page of paginated bookings.
   * Delays for 3 seconds before logging the loaded bookings to the console.
   */
  ngOnInit() {
    this.bs.loadPaginatedBookings(1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Searches for bookings based on the search term, and loads the first page of results.
   * @param searchTerm The search term to search for.
   */
  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.bs.loadPaginatedBookings(1, searchTerm);
  }

  /**
   * Opens the booking form without selecting a booking to edit.
   * @returns {void}
   */
  openForm() {
    this.formOpen.set(true);
    this.bs.selectedBooking.set(null);
    this.bs.successful.set(false);
  }

  /**
   * Closes the booking form and loads the current page of paginated bookings
   * based on the current search term.
   */
  closeForm() {
    this.formOpen.set(false);
    this.bs.loadPaginatedBookings(this.bs.currentPage(), this.searchInput());
  }

  /**
   * Opens the booking form in edit mode with the given booking pre-filled.
   * @param booking The booking to edit.
   * @returns {void}
   */
  openEditForm(booking: Booking) {
    this.formOpen.set(true);
    this.bs.selectedBooking.set(booking);
    this.bs.successful.set(false);
  }

  /**
   * Filters the bookings based on the provided filter criteria.
   *
   * The method updates the filter value and reloads the first page of
   * paginated bookings using the current search term.
   *
   * @param filter The filter criteria to apply.
   */
  filterBookings(filter: string) {
    this.bs.filterValue.set(filter);
    this.bs.loadPaginatedBookings(1, this.searchInput());
  }
}
