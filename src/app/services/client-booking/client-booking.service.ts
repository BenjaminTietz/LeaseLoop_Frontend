import { computed, inject, Injectable, signal } from '@angular/core';
import { Property } from '../../models/property.model';
import { Unit } from '../../models/unit.model';
import { Booking } from '../../models/booking.model';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientBookingService {
  httpService = inject(HttpService);
  properties = signal<Property[]>([]);
  units = signal<Unit[]>([]);
  bookings = signal<Booking[]>([]);

  selectedPropertyId = signal<number | null>(null);
  hotelName = signal<string>('Hotel Booking App');
  hotelDescription = signal<string>('Book your dream stay with us!');
  currentYear = signal<number>(new Date().getFullYear());
  checkInDate = signal<string | null>(null);
  checkOutDate = signal<string | null>(null);
  guestCount = signal<number>(1);

  selectedProperty = computed(() =>
    this.properties().find((p) => p.id === this.selectedPropertyId())
  );

  filteredUnits = computed(() =>
    this.units().filter((u) => u.property.id === this.selectedPropertyId())
  );

  loadBookingData() {
    this.httpService
      .get<{ properties: Property[]; bookings: Booking[] }>(
        `${environment.apiBaseUrl}/api/public/booking/testUser/`
      )
      .subscribe({
        next: (res) => {
          this.properties.set(res.properties);
          const allUnits = res.properties.flatMap((p) =>
            p.units.map((unit) => ({
              ...unit,
              propertyId: p.id,
            }))
          );
          this.units.set(allUnits);
          this.bookings.set(res.bookings);
        },
        error: (err) => console.error('Error loading booking data', err),
      });
  }

  selectProperty(id: number) {
    this.selectedPropertyId.set(id);
  }

  reset() {
    this.selectedPropertyId.set(null);
  }

  setCheckIn(date: string) {
    this.checkInDate.set(date);
    console.log('Check-in date set to:', date);
  }

  setCheckOut(date: string) {
    this.checkOutDate.set(date);
    console.log('Check-out date set to:', date);
  }

  setGuestCount(count: number) {
    const max = Math.max(...this.units().map((u) => u.max_capacity), 1);
    const validCount = Math.min(count, max);
    this.guestCount.set(validCount);

    if (count > max) {
      console.warn(
        `⚠️ Guest count '${count}' exceeds max allowed (${max}) – adjusted to ${validCount}.`
      );
    }

    console.log('Guest count set to:', validCount);
  }

  isValidRange = computed(() => {
    const inDate = this.checkInDate();
    const outDate = this.checkOutDate();
    return !!inDate && !!outDate && inDate < outDate;
  });

  filterUnitsByCheckInDate(date: string) {
    const checkIn = new Date(date);
    const guestCount = this.guestCount();

    const isOverlapping = (start: string, end: string) =>
      new Date(start) <= checkIn && checkIn < new Date(end);

    const filtered = this.units().filter((unit) => {
      if (
        unit.status !== 'available' ||
        !unit.active ||
        (unit as any).deleted ||
        unit.max_capacity < guestCount
      ) {
        return false;
      }

      // Buchungen prüfen
      const overlapping = this.bookings().some(
        (b) =>
          b.unit.id === unit.id &&
          b.status !== 'cancelled' &&
          isOverlapping(b.check_in, b.check_out)
      );

      return !overlapping;
    });

    console.log(
      `Filtered units for ${guestCount} guests on ${date}:`,
      filtered
    );
    return filtered;
  }
}
