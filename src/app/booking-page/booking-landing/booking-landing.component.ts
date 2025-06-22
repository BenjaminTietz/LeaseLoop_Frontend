import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';
import { CommonModule } from '@angular/common';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { LandingFooterComponent } from '../../shared/landing-components/landing-footer/landing-footer.component';
import { LogoComponent } from '../../shared/landing-components/logo/logo.component';
import { ImageSliderComponent } from '../../shared/booking-page/image-slider/image-slider.component';
import { RouterOutlet } from '@angular/router';
import { BookingStatusPopupComponent } from '../booking-status-popup/booking-status-popup.component';

@Component({
  selector: 'app-booking-landing',
  standalone: true,
  imports: [
    ThemeButtonComponent,
    CommonModule,
    LandingFooterComponent,
    LogoComponent,
    ImageSliderComponent,
    RouterOutlet,
    BookingStatusPopupComponent,
  ],
  templateUrl: './booking-landing.component.html',
  styleUrl: './booking-landing.component.scss',
})
export class BookingLandingComponent implements OnInit {
  bookingService = inject(ClientBookingService);
  showLocationDropdown = signal(false);
  searchInput = signal<string>('');
  today = new Date().toISOString().split('T')[0];

  filteredLocations = computed(() => {
    const allLocations = [
      ...this.bookingService.cityList(),
      ...this.bookingService.countryList(),
    ];
    return allLocations.filter((loc) =>
      loc.toLowerCase().includes(this.searchInput().toLowerCase())
    );
  });

  readonly searchIsComplete = computed(
    () =>
      this.searchInput().trim() &&
      this.bookingService.checkInDate() &&
      this.bookingService.checkOutDate() &&
      this.bookingService.guestCount() > 0 &&
      this.bookingService.properties().length > 0 &&
      this.bookingService.filteredMode()
  );

  onLocationInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    this.showLocationDropdown.set(!!value.trim());

    if (!value.trim()) {
      this.bookingService.resetFilters();
    }
  }

  onLocationSelect(location: string) {
    this.searchInput.set(location);
    this.showLocationDropdown.set(false);
    this.bookingService.filterPropertiesByLocation(location);
  }

  onBlurDropdownClose() {
    setTimeout(() => this.showLocationDropdown.set(false), 150);
  }

  clearSearchInput() {
    this.searchInput.set('');
    this.showLocationDropdown.set(false);
    this.bookingService.resetFilters();
  }

  navigator = inject(NavigatorService);
  ngOnInit() {
    this.bookingService.loadInitialData();
    this.clearSearchInput();
  }

  setCheckInFromEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    const checkIn = target.value;
    this.bookingService.setCheckIn(checkIn);

    const currentOut = this.bookingService.checkOutDate();
    if (!currentOut || new Date(currentOut) <= new Date(checkIn)) {
      const nextDay = new Date(checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      const iso = nextDay.toISOString().split('T')[0];
      this.bookingService.setCheckOut(iso);
    }
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

  searchAvailableUnits() {
    this.bookingService.fetchAvailableUnits();
  }

  maxGuestCapacity(): number {
    return Math.max(
      ...this.bookingService.units().map((u) => u.max_capacity),
      1
    );
  }

  resetPropertyDetails() {
    this.bookingService.hidePropertyDetails();
  }

  resetFilters() {
    this.bookingService.resetFilters();
    this.searchInput.set('');
  }
}
