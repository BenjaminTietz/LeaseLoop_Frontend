import { computed, inject, Injectable, signal } from '@angular/core';
import { Property } from '../../models/property.model';
import { Unit } from '../../models/unit.model';
import { Booking } from '../../models/booking.model';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { NavigatorService } from '../navigator/navigator.service';

@Injectable({
  providedIn: 'root',
})
export class ClientBookingService {
  httpService = inject(HttpService);
  navigator  = inject(NavigatorService);
  properties = signal<Property[]>([]);
  units = signal<Unit[]>([]);
  bookings = signal<Booking[]>([]);

  selectedPropertyId = signal<number | null>(null);

  //TODO: delete and hardcode in html template
  hotelName = signal<string>('Hotel Booking App');
  hotelDescription = signal<string>('Book your dream stay with us!');

  currentYear = signal<number>(new Date().getFullYear());
  checkInDate = signal<string | null>(null);
  checkOutDate = signal<string | null>(null);
  guestCount = signal<number>(1);
  filteredMode = signal(false);
  selectedPropertyDetail = signal<Property | null>(null);
  searchCountry = signal<string>('');
  searchCity = signal<string>('');

  countryList = computed(() =>
    [
      ...new Set(
        this.properties()
          .map((p) => p.address?.country)
          .filter(Boolean)
      ),
    ].sort()
  );

  cityList = computed(() =>
    [
      ...new Set(
        this.properties()
          .map((p) => p.address?.city)
          .filter(Boolean)
      ),
    ].sort()
  );

  filteredCountryList = computed(() =>
    this.countryList().filter((country) =>
      country.toLowerCase().includes(this.searchCountry().toLowerCase().trim())
    )
  );

  filteredCityList = computed(() =>
    this.cityList().filter((city) =>
      city.toLowerCase().includes(this.searchCity().toLowerCase().trim())
    )
  );

  selectedCountry = signal<string | null>(null);
  selectedCity = signal<string | null>(null);

  selectedProperty = computed(() =>
    this.properties().find((p) => p.id === this.selectedPropertyId())
  );

  filteredUnits = computed(() =>
    this.units().filter((u) => u.property.id === this.selectedPropertyId())
  );

  // load all properties of all users with pagination
  loadInitialData(page: number = 1, pageSize: number = 20) {
    this.httpService
      .get<any>(
        `${environment.apiBaseUrl}/api/public/booking/?page=${page}&page_size=${pageSize}`
      )
      .subscribe({
        next: (res) => {
          const properties = res.data.properties;
          this.properties.set(properties);

          const allUnits = properties.flatMap((p: any) =>
            p.units.map((unit: any) => ({
              ...unit,
              propertyId: p.id,
            }))
          );
          this.units.set(allUnits);
          this.filteredMode.set(false);
        },
        error: (err) =>
          console.error('Error loading paginated properties and units', err),
      });
  }

  filterPropertiesByLocation(
    city: string | null,
    country: string | null,
    page = 1,
    pageSize = 20
  ) {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (country) params.set('country', country);
    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());

    this.httpService
      .get<any>(
        `${environment.apiBaseUrl}/api/public/booking/?${params.toString()}`
      )
      .subscribe({
        next: (res) => {
          const properties = res.data.properties;
          this.properties.set(properties);

          const allUnits = properties.flatMap((p: any) =>
            p.units.map((unit: any) => ({ ...unit, propertyId: p.id }))
          );
          this.units.set(allUnits);
          this.filteredMode.set(true);
        },
        error: (err) => console.error('Error filtering properties', err),
      });
  }

  fetchAvailableUnits() {
    const checkIn = this.checkInDate();
    const checkOut = this.checkOutDate();
    const guests = this.guestCount();

    if (!checkIn || !checkOut) return;

    const params = new HttpParams()
      .set('check_in', checkIn)
      .set('check_out', checkOut)
      .set('guests', guests.toString());

    this.httpService
      .get<Unit[]>(
        `${
          environment.apiBaseUrl
        }/api/public/booking/available-units/?${params.toString()}`
      )
      .subscribe({
        next: (units) => {
          this.units.set(units);
          this.filteredMode.set(true);
        },
        error: (err) => console.error('Error fetching available units', err),
      });
  }

  resetFilters() {
    this.loadInitialData();
    this.filteredMode.set(false);
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

  showPropertyDetails(property: Property) {
    this.selectedPropertyDetail.set(property);
    this.navigator.navigateTo(`/property/${property.id}/`);
  }

  hidePropertyDetails() {
    this.selectedPropertyDetail.set(null);
  }

  setSelectedCountry(country: string) {
    this.selectedCountry.set(country);
    this.searchCountry.set(country);
  }

  setSelectedCity(city: string) {
    this.selectedCity.set(city);
    this.searchCity.set(city);
  }
}
