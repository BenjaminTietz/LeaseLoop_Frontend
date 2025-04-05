import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './availability-calendar.component.html',
  styleUrl: './availability-calendar.component.scss',
})
export class AvailabilityCalendarComponent implements OnInit {
  properties = [
    { id: 1, name: 'Villa Vista' },
    { id: 2, name: 'Seaside Loft' },
  ];

  allUnits = [
    { id: 1, name: 'Apartment A', propertyId: 1 },
    { id: 2, name: 'Apartment B', propertyId: 1 },
    { id: 3, name: 'Room C', propertyId: 2 },
    { id: 4, name: 'Suite D', propertyId: 2 },
  ];

  allBookings = [
    { unitId: 1, from: '2025-04-03', to: '2025-04-06', guest: 'Alice Schmidt' },
    { unitId: 1, from: '2025-04-10', to: '2025-04-14', guest: 'Tom Berger' },
    { unitId: 2, from: '2025-04-05', to: '2025-04-08', guest: 'Lena Weiß' },
    { unitId: 3, from: '2025-04-11', to: '2025-04-13', guest: 'Elisa Meyer' },
    { unitId: 4, from: '2025-04-20', to: '2025-04-24', guest: 'Paul König' },
  ];

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

  selectedPropertyId = signal<number>(1);
  selectedMonth = signal<number>(new Date().getMonth());
  selectedYear = signal<number>(new Date().getFullYear());

  dates = signal<Date[]>([]);
  availability = signal<Record<number, Record<string, 0 | 1>>>({});
  bookings = signal<any[]>([]);

  units = computed(() =>
    this.allUnits.filter((u) => u.propertyId === this.selectedPropertyId())
  );

  filteredBookings = computed(() => {
    const unitIds = this.units().map((u) => u.id);
    return this.bookings().filter((b) => unitIds.includes(b.unitId));
  });

  ngOnInit(): void {
    this.generateDatesForMonth(this.selectedYear(), this.selectedMonth());
  }

  calendarEffect = effect(
    () => {
      this.generateDatesForMonth(this.selectedYear(), this.selectedMonth());
      this.loadBookings();
    },
    { allowSignalWrites: true }
  );

  generateDatesForMonth(year: number, month: number): void {
    const dates: Date[] = [];
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    this.dates.set(dates);
  }

  loadBookings(): void {
    const unitIds = this.units().map((u) => u.id);
    const filtered = this.allBookings.filter((b) => unitIds.includes(b.unitId));
    this.bookings.set(filtered);
  }

  dayString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isAvailable(unitId: number, date: Date): boolean {
    const dateStr = this.dayString(date);
    const unitAvailability = this.availability()?.[unitId];
    return unitAvailability?.[dateStr] !== 0;
  }

  hasBooking(unitId: number, day: Date): boolean {
    const dateStr = this.dayString(day);
    return this.filteredBookings().some(
      (b) => b.unitId === unitId && dateStr >= b.from && dateStr < b.to
    );
  }

  getBookingLabel(unitId: number, day: Date): string {
    const booking = this.filteredBookings().find(
      (b) =>
        b.unitId === unitId &&
        this.dayString(day) >= b.from &&
        this.dayString(day) < b.to
    );
    return booking ? booking.guest : '';
  }

  getBookingColor(): string {
    return '#4589FF';
  }

  getBookingInfo(unitId: number, day: Date): string {
    return this.getBookingLabel(unitId, day);
  }

  get selectedPropertyIdSignal() {
    return this.selectedPropertyId();
  }
  set selectedPropertyIdSignal(val: number) {
    this.selectedPropertyId.set(val);
  }
}
