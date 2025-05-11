import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { UnitSliderComponent } from '../unit-slider/unit-slider.component';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';
import { CommonModule } from '@angular/common';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-booking-landing',
  standalone: true,
  imports: [UnitSliderComponent, ThemeButtonComponent, CommonModule],
  templateUrl: './booking-landing.component.html',
  styleUrl: './booking-landing.component.scss',
})
export class BookingLandingComponent implements OnInit {
  bookingService = inject(ClientBookingService);
  currentIndex = signal(0);
  showCountryDropdown = signal(false);
  showCityDropdown = signal(false);
  navigationService = inject(NavigatorService);
  ngOnInit() {
    this.bookingService.loadInitialData();
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
  }

  onCountrySearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.bookingService.searchCountry.set(target.value);
  }

  onCitySearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.bookingService.searchCity.set(target.value);
  }

  onCountrySelectCustom(country: string) {
    this.bookingService.setSelectedCountry(country);
    this.filterByLocation();
  }

  onCitySelectCustom(city: string) {
    this.bookingService.setSelectedCity(city);
    this.filterByLocation();
  }

  filterByLocation() {
    this.bookingService.filterPropertiesByLocation(
      this.bookingService.selectedCity(),
      this.bookingService.selectedCountry()
    );
  }

  hideDropdown(type: 'country' | 'city') {
    setTimeout(() => {
      if (type === 'country') this.showCountryDropdown.set(false);
      if (type === 'city') this.showCityDropdown.set(false);
    }, 150);
  }
}
