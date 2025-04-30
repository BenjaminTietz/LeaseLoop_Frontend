import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClientBookingService {
  properties = signal([
    {
      id: 1,
      name: 'Sunset Apartments',
      description: 'Beautiful seaside view',
      image: 'demo/property/property_1.jpg',
    },
    {
      id: 2,
      name: 'Mountain Retreat',
      description: 'Quiet mountain escape',
      image: 'demo/property/property_2.jpg',
    },
  ]);

  units = signal([
    {
      id: 1,
      propertyId: 1,
      name: 'Balcony Studio',
      image: 'demo/unit/unit_1.jpg',
    },
    {
      id: 2,
      propertyId: 1,
      name: 'Ocean View',
      image: 'demo/unit/unit_2.jpg',
    },
    {
      id: 3,
      propertyId: 2,
      name: 'Mountain Suite',
      image: 'demo/unit/unit_3.jpg',
    },
  ]);

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
    this.units().filter((u) => u.propertyId === this.selectedPropertyId())
  );

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
    this.guestCount.set(count);
    console.log('Guest count set to:', count);
  }

  isValidRange = computed(() => {
    const inDate = this.checkInDate();
    const outDate = this.checkOutDate();
    return !!inDate && !!outDate && inDate < outDate;
  });
}
