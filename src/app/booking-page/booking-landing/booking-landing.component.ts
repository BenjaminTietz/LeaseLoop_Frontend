import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AvailabilityCalendarComponent } from '../../shared/dashboard-components/availability-calendar/availability-calendar.component';
import { PropertySliderComponent } from '../property-slider/property-slider.component';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { UnitSliderComponent } from '../unit-slider/unit-slider.component';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';

@Component({
  selector: 'app-booking-landing',
  standalone: true,
  imports: [
    AvailabilityCalendarComponent,
    PropertySliderComponent,
    UnitSliderComponent,
    ThemeButtonComponent,
  ],
  templateUrl: './booking-landing.component.html',
  styleUrl: './booking-landing.component.scss',
})
export class BookingLandingComponent implements OnInit {
  bookingService = inject(ClientBookingService);

  currentIndex = signal(0);

  properties = computed(() => this.bookingService.properties());

  currentProperty = computed(() => this.properties()[this.currentIndex()]);

  next() {
    const nextIndex = (this.currentIndex() + 1) % this.properties().length;
    this.currentIndex.set(nextIndex);
  }

  prev() {
    const total = this.properties().length;
    const newIndex = (this.currentIndex() - 1 + total) % total;
    this.currentIndex.set(newIndex);
  }

  setCheckInFromEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    this.bookingService.setCheckIn(target.value);
  }

  setCheckOutFromEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    this.bookingService.setCheckOut(target.value);
  }

  setGuestCountFromEvent(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.bookingService.setGuestCount(isNaN(value) ? 1 : value);
  }

  ngOnInit() {
    this.bookingService.loadBookingData();
  }
}
