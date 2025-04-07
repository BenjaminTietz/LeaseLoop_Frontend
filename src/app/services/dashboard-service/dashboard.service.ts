import { effect, inject, Injectable, OnInit, signal } from '@angular/core';
import { BookingsService } from '../bookings-service/bookings.service';
import { UnitsService } from '../units-service/units.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements OnInit {
  bookingService = inject(BookingsService);
  unitService = inject(UnitsService);

  nextArrivalSignal = signal('');
  nextDepartureSignal = signal('');
  guestsSignal = signal(0);
  currentOccupancySignal = signal(0);
  monthlyOccupancySignal = signal(0);

  nextArrival = effect(
    () => {
      const bookings = this.bookingService.bookings();
      if (bookings && bookings.length > 0) {
        const nextArrival = bookings.sort(
          (a, b) =>
            new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
        )[0];
        if (nextArrival) {
          this.nextArrivalSignal.set(`${nextArrival.check_in}`);
          console.log('Next arrival:', nextArrival);
        }
      }
    },
    { allowSignalWrites: true }
  );

  nextDepature = effect(
    () => {
      const bookings = this.bookingService.bookings();
      if (bookings && bookings.length > 0) {
        const nextDeparture = bookings.sort(
          (a, b) =>
            new Date(a.check_out).getTime() - new Date(b.check_out).getTime()
        )[0];
        if (nextDeparture) {
          this.nextDepartureSignal.set(`${nextDeparture.check_out}`);
          console.log('Next departure:', nextDeparture);
        }
      }
    },
    { allowSignalWrites: true }
  );

  guests = effect(
    () => {
      const bookings = this.bookingService.bookings();
      if (bookings && bookings.length > 0) {
        const today = new Date();

        const guestsToday = bookings.filter((booking) => {
          const checkIn = new Date(booking.check_in);
          const checkOut = new Date(booking.check_out);

          return checkIn <= today && checkOut >= today;
        });

        const totalGuests = guestsToday.reduce(
          (sum, booking) => sum + booking.guests,
          0
        );

        this.guestsSignal.set(totalGuests);
        console.log('Guests currently in properties:', totalGuests);
      }
    },
    { allowSignalWrites: true }
  );

  todayOccupancy = effect(
    () => {
      const bookings = this.bookingService.bookings();
      const units = this.unitService.units();
      if (!bookings || !units || bookings.length === 0 || units.length === 0)
        return;

      const today = new Date();
      const occupiedToday = bookings.filter((b) => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);
        return today >= checkIn && today < checkOut;
      });

      const percentage = (occupiedToday.length / units.length) * 100;
      this.currentOccupancySignal.set(Math.round(percentage));
    },
    { allowSignalWrites: true }
  );

  monthlyOccupancy = effect(
    () => {
      const bookings = this.bookingService.bookings();
      const units = this.unitService.units();
      if (!bookings || !units || bookings.length === 0 || units.length === 0)
        return;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const totalAvailableNights = units.length * endOfMonth.getDate();

      let occupiedNights = 0;
      bookings.forEach((b) => {
        const checkIn = new Date(b.check_in);
        const checkOut = new Date(b.check_out);

        const actualStart = checkIn < startOfMonth ? startOfMonth : checkIn;
        const actualEnd = checkOut > endOfMonth ? endOfMonth : checkOut;

        const diff =
          (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 0) occupiedNights += diff;
      });

      const percentage = (occupiedNights / totalAvailableNights) * 100;
      this.monthlyOccupancySignal.set(Math.round(percentage));
    },
    { allowSignalWrites: true }
  );

  constructor() {}

  ngOnInit(): void {}
}
