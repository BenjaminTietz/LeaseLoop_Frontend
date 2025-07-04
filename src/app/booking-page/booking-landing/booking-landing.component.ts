import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';
import { CommonModule } from '@angular/common';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { LandingFooterComponent } from '../../shared/landing-components/landing-footer/landing-footer.component';
import { LogoComponent } from '../../shared/landing-components/logo/logo.component';
import { RouterOutlet } from '@angular/router';
import { BookingStatusPopupComponent } from '../booking-status-popup/booking-status-popup.component';
import { InfoOverlayComponent } from "../../shared/global/info-overlay/info-overlay.component";
import { disableBackgroundScroll, enableBackgroundScroll } from '../../utils/scroll.utils';

@Component({
  selector: 'app-booking-landing',
  standalone: true,
  imports: [
    ThemeButtonComponent,
    CommonModule,
    LandingFooterComponent,
    LogoComponent,
    RouterOutlet,
    BookingStatusPopupComponent,
    InfoOverlayComponent
],
  templateUrl: './booking-landing.component.html',
  styleUrl: './booking-landing.component.scss',
})
export class BookingLandingComponent implements OnInit {
  bookingService = inject(ClientBookingService);
  navigator = inject(NavigatorService);
  showLocationDropdown = signal(false);
  searchInput = signal<string>('');
  today = new Date().toISOString().split('T')[0];
  hasSearched = signal(false);
  infoOverlay = signal(false);

  filteredLocations = computed(() => {
    const allLocations = [
      ...this.bookingService.cityList(),
      ...this.bookingService.countryList(),
    ];
    return allLocations.filter((loc) =>
      loc.toLowerCase().includes(this.searchInput().toLowerCase())
    );
  });

  disableSearchButton = computed(() =>
  this.searchInput().trim() === '' ||
  this.bookingService.checkInDate() === '' ||
  this.bookingService.checkOutDate() === '' ||
  this.bookingService.guestCount() < 1 ||
  this.bookingService.guestCount() > this.maxGuestCapacity()
);
  

  readonly searchIsComplete = computed(() =>
  this.hasSearched() &&
  this.searchInput().trim() !== '' &&
  this.bookingService.checkInDate() !== '' &&
  this.bookingService.checkOutDate() !== '' &&
  this.bookingService.guestCount() >= 1 &&
  this.bookingService.guestCount() <= this.maxGuestCapacity() &&
  this.bookingService.properties().length > 0 &&
  this.bookingService.filteredMode()
);

  /**
   * Initializes the component by loading the initial data and clearing the search input.
   */
  ngOnInit() {
    this.hasSearched.set(false);
    this.bookingService.loadInitialData();
    this.clearSearchInput();
    this.showLocationDropdown.set(false);
    this.bookingService.selectedPropertyDetail.set(null);
    if(sessionStorage.getItem('infoShownBooking') === 'true') {
      this.infoOverlay.set(false);
    }else{
      this.infoOverlay.set(true);
    }
  }

  closeInfo() {
    enableBackgroundScroll();
    this.infoOverlay.set(false);
    sessionStorage.setItem('infoShownBooking', 'true');
  }

  /**
   * Handles input change event on the location input.
   * Trims the input value, updates the searchInput signal and the showLocationDropdown signal.
   * If the input value is empty, resets the filters.
   * @param event the event object
   */
  onLocationInput(event: Event) {
    this.hasSearched.set(false);
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    this.showLocationDropdown.set(!!value.trim());
    this.bookingService.searchLocation.set(value);
    if (!value.trim()) {
      this.bookingService.resetFilters();
    }
  }

  /**
   * Handles the selection of a location from the dropdown.
   * Sets the search input to the selected location, closes the dropdown and
   * filters the properties by the selected location.
   * @param location the selected location
   */
  onLocationSelect(location: string) {
    this.hasSearched.set(false);
    this.searchInput.set(location);
    this.showLocationDropdown.set(false);
    this.bookingService.filterPropertiesByLocation(location);
    this.bookingService.searchLocation.set(location);
  }

  /**
   * Handles the blur event on the location input field.
   * This is to handle the case where the user clicks outside the dropdown but
   * not on the body (e.g. on the search button). This code is necessary because
   * the dropdown is not a descendant of the input field, so we need to manually
   * close it when the input field loses focus.
   */
  onBlurDropdownClose() {
    this.hasSearched.set(false);
    setTimeout(() => this.showLocationDropdown.set(false), 150);
  }

  /**
   * Clears the search input and resets the filters.
   */
  clearSearchInput() {
    this.hasSearched.set(false);
    this.searchInput.set('');
    this.bookingService.resetFilters();
    this.showLocationDropdown.set(false);
  }

  /**
   * Handles the input event for the check-in date field.
   * Sets the check-in date in the booking service and updates the check-out date if necessary.
   * If the current check-out date is not set or is before the new check-in date,
   * the check-out date is set to the day after the new check-in date.
   *
   * @param event - The input event from the check-in date field.
   */

  setCheckInFromEvent(event: Event) {
    this.hasSearched.set(false);
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

  /**
   * Handles the input event for the check-out date field.
   * Sets the check-out date in the booking service.
   * @param event - The input event from the check-out date field.
   */
  setCheckOutFromEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    this.bookingService.setCheckOut(target.value);
  }

  /**
   * Handles the input event for the guest count field.
   * Sets the guest count in the booking service, ensuring it is a valid number.
   * If the input value is not a valid number, it is set to 1.
   * @param event - The input event from the guest count field.
   */
  onGuestCountTyping(event: Event) {
    this.hasSearched.set(false);
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.bookingService.setGuestCount(isNaN(value) ? 1 : value);
  }

  /**
   * Clamps the guest count to a valid value when the user stops typing.
   * If the input value is not a valid number, it is set to 1.
   * If the input value is greater than the maximum guest capacity, it is set to the maximum guest capacity.
   * @param event - The input event from the guest count field.
   */
  clampGuestCount(event: Event) {
    this.hasSearched.set(false);
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    const max = this.maxGuestCapacity();

    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > max) {
      value = max;
    }

    this.bookingService.setGuestCount(value);
    input.value = value.toString();
  }

  /**
   * Initiates the fetching of available units for the current search parameters.
   * Triggers the booking service to fetch units that match the current check-in date,
   * check-out date and guest count.
   */
  searchAvailableUnits() {
    this.hasSearched.set(true);
    this.bookingService.fetchAvailableUnits();

  }

  /**
   * Calculates the maximum guest capacity for the available units.
   * @returns The highest maximum guest capacity from all available units, or 1 if no units are available.
   */
  maxGuestCapacity(): number {
    return Math.max(
      ...this.bookingService.units().map((u) => u.max_capacity),
      1
    );
  }

  /**
   * Resets the property details to be hidden.
   * This is used after a unit is selected to hide the property details
   * until a new property is selected.
   */
  resetPropertyDetails() {
    this.hasSearched.set(false);
    this.bookingService.hidePropertyDetails();
  }

  /**
   * Resets the search filters to their default state.
   * This also resets the search input field to be empty.
   */
  resetFilters() {
    this.hasSearched.set(false);
    this.bookingService.resetFilters();
    this.searchInput.set('');
  }
}
