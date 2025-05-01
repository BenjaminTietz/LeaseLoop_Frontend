import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookingsService } from '../../../services/bookings-service/bookings.service';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { UnitsService } from '../../../services/units-service/units.service';
import { HorizontalDirectivesDirective } from '../../../directives/horizontal-scroll/horizontal-directives.directive';
import { DashboardService } from '../../../services/dashboard-service/dashboard.service';
import { timeout } from 'rxjs';
import { ProgressBarComponent } from "../../global/progress-bar/progress-bar.component";
@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule, HorizontalDirectivesDirective, ProgressBarComponent],
  templateUrl: './availability-calendar.component.html',
  styleUrl: './availability-calendar.component.scss',
})
export class AvailabilityCalendarComponent {
  bookingService = inject(BookingsService);
  propertyService = inject(PropertiesService);
  unitService = inject(UnitsService);
  dashboardService = inject(DashboardService);
  months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

  selectedMonth = signal<number>(new Date().getMonth());
  selectedYear = signal<number>(new Date().getFullYear());

  selectedPropertyId = signal(0);

  dates = signal<Date[]>([]);
  availability = signal<Record<number, Record<string, 0 | 1>>>({});
  sortedBookings = signal<any[]>([]);

  allDataLoaded = computed(
    () =>
      this.propertyService.properties().length > 0 &&
      this.unitService.units().length > 0 &&
      this.bookingService.bookings().length > 0
  );

  constructor() {
    this.propertyService.loadProperties();
    this.unitService.loadUnits();
    this.bookingService.loadBooking();
    effect(
      () => {
        if (this.allDataLoaded()) {
          this.selectedPropertyId.set(this.propertyService.properties()[0].id);
          this.generateDatesForMonth(this.selectedYear(), this.selectedMonth());
        }
      },
      { allowSignalWrites: true }
    );
  }

  onDateChange() {
    this.generateDatesForMonth(this.selectedYear(), this.selectedMonth());
  }

  units = computed(() =>
    this.unitService
      .units()
      .filter((u) => u.property.id === this.selectedPropertyId())
  );

  filteredBookings = computed(() => {
    const unitIds = this.units().map((u) => u.id);
    return this.bookingService
      .bookings()
      .filter((b) => unitIds.includes(b.unit.id));
  });

  /**
   * Generates an array of dates for the given month and year and sets it as the value
   * of the dates signal.
   *
   * @param year - The year of the month to generate dates for.
   * @param month - The month of the year to generate dates for.
   */
  generateDatesForMonth(year: number, month: number): void {
    const dates: Date[] = [];
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    }

    this.dates.set(dates);
  }

  /**
   * Filters the bookings of the bookings service by the IDs of the units currently visible
   * in the component and sets the result as the value of the sortedBookings signal.
   *
   * This is used to update the bookings displayed in the component when the selected property
   * changes.
   */
  loadBookings(): void {
    const unitIds = this.units().map((u) => u.id);
    const filtered = this.bookingService
      .bookings()
      .filter((b) => unitIds.includes(b.unit.id));
    this.sortedBookings.set(filtered);
  }

  /**
   * Returns a string representation of the given date, in the format 'YYYY-MM-DD'.
   *
   * @param date - The date to format.
   *
   * @returns {string} A string representation of the date, in the format 'YYYY-MM-DD'.
   */
  dayString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Checks if a unit is available on a specific date.
   *
   * @param unitId - The ID of the unit.
   * @param date - The date to check for availability.
   *
   * @returns {boolean} true if the unit is available, false if not.
   */
  isAvailable(unitId: number, date: Date): boolean {
    const dateStr = this.dayString(date);
    const unitAvailability = this.availability()?.[unitId];
    return unitAvailability?.[dateStr] !== 0;
  }

  /**
   * Checks if a booking exists for a given unit on a specific day.
   *
   * @param unitId - The ID of the unit.
   * @param day - The day to check for a booking.
   *
   * @returns {boolean} true if a booking exists, false if not.
   */
  hasBooking(unitId: number, day: Date): boolean {
    const dayTime = day.getTime();
    return this.filteredBookings().some((b) => {
      const checkIn = this.normalizeDate(b.check_in);
      const checkOut = this.normalizeDate(b.check_out);
      return (
        b.unit.id === unitId &&
        dayTime >= checkIn.getTime() &&
        dayTime < checkOut.getTime()
      );
    });
  }

  /**
   * Retrieves the label for a booking on a specific day for a given unit.
   *
   * @param unitId - The ID of the unit.
   * @param day - The day to check for a booking.
   * @returns {string} The first name of the booking client, or an empty string if no booking is found.
   */

  getBookingLabel(unitId: number, day: Date): string {
    const dayTime = day.getTime();
    const booking = this.filteredBookings().find((b) => {
      const checkIn = this.normalizeDate(b.check_in);
      const checkOut = this.normalizeDate(b.check_out);
      return (
        b.unit.id === unitId &&
        dayTime >= checkIn.getTime() &&
        dayTime < checkOut.getTime()
      );
    });
    return booking ? booking.client.first_name : '';
  }

  /**
   * Returns the color associated with a booking.
   *
   * @returns A string representing the color code for bookings.
   */

  getBookingColor(unitId: any, day: Date) {
    const booking = this.filteredBookings().find(
      (b) =>
        b.unit.id === unitId &&
        this.dayString(day) < b.check_in &&
        this.dayString(day) < b.check_out
    );
    if(booking?.status === 'confirmed') {
      return 'green';
    }
    if(booking?.status === 'pending') {
      return '#FFC810';
    }
    return 'red';
    
  }

  /**
   * Gets the name of the booking guest for a given unit and day.
   *
   * @param unitId - The ID of the unit.
   * @param day - The day to look up.
   *
   * @returns {string} The name of the guest, or an empty string if no booking exists.
   */
  getBookingInfo(unitId: number, day: Date): string {
    return this.getBookingLabel(unitId, day);
  }

  normalizeDate(dateString: string): Date {
    return new Date(dateString + 'T00:00:00');
  }

  onBookingClick(unitId: number, day: Date): void {
    const booking = this.filteredBookings().find(
      (b) =>
        b.unit.id === unitId &&
        this.dayString(day) < b.check_in &&
        this.dayString(day) < b.check_out
    );
    if (booking) {
      this.dashboardService.showBooking.set(booking);
      this.dashboardService.isbookingPopupOpen.set(true);
    }
  }

  onSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedPropertyId.set(Number(select.value));
    this.loadBookings();
    this.generateDatesForMonth(this.selectedYear(), this.selectedMonth());
  }
}
