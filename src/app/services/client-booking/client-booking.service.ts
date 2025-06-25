import { computed, inject, Injectable, signal } from '@angular/core';
import { Property } from '../../models/property.model';
import { Unit } from '../../models/unit.model';
import { Booking } from '../../models/booking.model';
import { HttpService } from '../httpclient/http.service';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { NavigatorService } from '../navigator/navigator.service';
import { Service } from '../../models/service.model';
import { PromoCode } from '../../models/promocode.model';
import { Observable } from 'rxjs';
import { Clients } from '../../models/clients.model';

type BookingPopupStatus = {
  status: 'confirmed' | 'pending' | 'unavailable';
  message: string;
  bookingId?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ClientBookingService {
  httpService = inject(HttpService);
  navigator = inject(NavigatorService);
  properties = signal<Property[]>([]);
  units = signal<Unit[]>([]);
  bookings = signal<Booking[]>([]);
  selectedPropertyId = signal<number | null>(null);
  currentYear = signal<number>(new Date().getFullYear());
  checkInDate = signal<string | null>(null);
  checkOutDate = signal<string | null>(null);
  guestCount = signal<number>(1);
  filteredMode = signal(false);
  selectedPropertyDetail = signal<Property | null>(null);
  services = signal<Service[]>([]);
  clientId = signal<number | null>(null);

  showPropertyDetail = signal(false);

  bookingStatusPopup = signal<BookingPopupStatus | null>(null);

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

  selectedProperty = computed(() =>
    this.properties().find((p) => p.id === this.selectedPropertyId())
  );

  filteredUnits = computed(() =>
    this.units().filter((u) => u.property.id === this.selectedPropertyId())
  );

  /**
   * Loads initial data for the client booking service.
   * This includes fetching paginated properties and their corresponding units
   * from the server and updating the properties and units signals.
   * The method resets the filteredMode to false after loading.
   *
   * @param page - The page number to fetch, defaults to 1.
   * @param pageSize - The number of items per page, defaults to 20.
   */
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

  /**
   * Filters the properties by location and updates the properties and units signals.
   * The location can be a city or a country.
   * If the location is a city, the properties in that city are fetched.
   * If the location is a country, the properties in that country are fetched.
   * The page and pageSize parameters are optional and default to 1 and 20 respectively.
   * @param location The location to filter the properties by, or null to reset the filter.
   * @param page The page number to fetch, defaults to 1.
   * @param pageSize The number of items per page, defaults to 20.
   */
  filterPropertiesByLocation(location: string | null, page = 1, pageSize = 20) {
    const params = new URLSearchParams();
    if (location) {
      if (this.cityList().includes(location)) {
        params.set('city', location);
      } else if (this.countryList().includes(location)) {
        params.set('country', location);
      }
    }
    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());
    this.httpService
      .get<any>(`${environment.apiBaseUrl}/api/public/booking/?${params}`)
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

  /**
   * Fetches the available units for the current search parameters and updates the units signal.
   * The search parameters are the current check-in date, check-out date and guest count.
   * If any of these parameters are missing, the method returns without doing anything.
   * The method uses the httpService to fetch the available units from the server.
   * The request parameters are the current check-in date, check-out date and guest count.
   * The response is an array of units that are available for the given search parameters.
   * The method updates the units signal with the response.
   * If the request fails, the method logs an error message to the console.
   */
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

  /**
   * Loads services for a given property and updates the services signal.
   * It sends a GET request to the server with the property ID as a query parameter
   * to fetch the list of services available for that property.
   * The response, which is an array of services, is then set to the services signal.
   * If the request fails, an error message is logged to the console.
   *
   * @param propertyId - The ID of the property for which services are to be loaded.
   */
  loadServicesForProperty(propertyId: number) {
    this.httpService
      .get<Service[]>(
        `${environment.apiBaseUrl}/api/public/services/?property=${propertyId}`
      )
      .subscribe({
        next: (res) => this.services.set(res),
        error: (err) => console.error('Error loading public services', err),
      });
  }

  /**
   * Validates a promo code against the server.
   *
   * This function takes a promo code as a string and sends a POST request to the server
   * with the code and the current property owner ID as payload.
   * The response is an observable that emits the validated promo code.
   * If the request fails, the observable will error.
   *
   * @param code - The promo code to be validated.
   * @returns An observable that emits the validated promo code.
   */
  validatePromoCode(code: string): Observable<PromoCode> {
    const payload = {
      code: code,
      owner_id: this.selectedPropertyDetail()?.owner,
    };
    return this.httpService.post<PromoCode>(
      `${environment.apiBaseUrl}/api/public/promocode/validate/`,
      payload
    );
  }

  /**
   * Creates a new public client with the given data.
   *
   * This function sends a POST request to the server with the client data and the
   * current property owner ID as payload. The response is an observable that emits
   * the created client.
   * If the request fails, the observable will error.
   *
   * @param clientData - The data to be used to create the new client.
   * @returns An observable that emits the created client.
   */
  createPublicClient(clientData: any): Observable<Clients> {
    const ownerId = this.selectedPropertyDetail()?.owner;
    const payload = {
      ...clientData,
      owner_id: ownerId,
    };
    return this.httpService.post<Clients>(
      `${environment.apiBaseUrl}/api/public/create-client/`,
      payload
    );
  }

  /**
   * Resets all filters to their default values, and reloads the initial data.
   *
   * This function is used to reset the UI state of the booking page when the
   * user wants to start over from a blank slate.
   */
  resetFilters() {
    this.loadInitialData();
    this.filteredMode.set(false);
    this.checkInDate.set('');
    this.checkOutDate.set('');
    this.guestCount.set(1);
  }

  /**
   * Sets the selected property ID and updates the selected property detail observable.
   * Logs the selected property ID and its detail to the console.
   * @param id - The ID of the property to select.
   */
  selectProperty(id: number) {
    this.selectedPropertyId.set(id);
    const prop = this.getPropertyById(id);
    if (prop) {
      this.selectedPropertyDetail.set(prop);
    }
  }

  /**
   * Resets the selected property ID to null.
   * This is used when the user wants to start over from a blank slate.
   */
  reset() {
    this.selectedPropertyId.set(null);
  }

  /**
   * Sets the check-in date to the given date string.
   * The date string is expected to be in the format 'YYYY-MM-DD'.
   * Logs the check-in date to the console.
   * @param date - The date string to set the check-in to.
   */
  setCheckIn(date: string) {
    this.checkInDate.set(date);
  }

  /**
   * Sets the check-out date to the given date string.
   * The date string is expected to be in the format 'YYYY-MM-DD'.
   * Logs the check-out date to the console.
   * @param date - The date string to set the check-out to.
   */
  setCheckOut(date: string) {
    this.checkOutDate.set(date);
  }

  /**
   * Sets the guest count to the given number, but ensures that it does not exceed
   * the maximum capacity of the currently selected unit. If the given count is
   * greater than the maximum capacity, it will be adjusted to the maximum
   * capacity and a warning message will be logged to the console.
   *
   * @param count - The new guest count.
   */
  setGuestCount(count: number) {
    const max = Math.max(...this.units().map((u) => u.max_capacity), 1);
    const validCount = Math.min(count, max);
    this.guestCount.set(validCount);
    if (count > max) {
      console.warn(
        `⚠️ Guest count '${count}' exceeds max allowed (${max}) – adjusted to ${validCount}.`
      );
    }
  }

  isValidRange = computed(() => {
    const inDate = this.checkInDate();
    const outDate = this.checkOutDate();
    return !!inDate && !!outDate && inDate < outDate;
  });

  /**
   * Filters the available units by the given check-in date and guest count.
   *
   * Given a check-in date and a guest count, this method filters the available
   * units to only include those that are not already booked on the given date
   * and have a maximum capacity that is equal to or greater than the given
   * guest count.
   *
   * @param date - The check-in date to filter by in the format 'YYYY-MM-DD'.
   * @returns An array of units that are available for the given check-in date
   * and guest count.
   */
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
      const overlapping = this.bookings().some(
        (b) =>
          b.unit.id === unit.id &&
          b.status !== 'cancelled' &&
          isOverlapping(b.check_in, b.check_out)
      );
      return !overlapping;
    });
    return filtered;
  }

  /**
   * Shows the property detail page for the given property.
   * Sets the selected property detail observable to the given property and
   * navigates to the property detail page.
   * @param property - The property to show the detail page for.
   */
  showPropertyDetails(property: Property) {
    this.selectedPropertyDetail.set(property);
    this.showPropertyDetail.set(true);
    this.navigator.navigateTo(`/property/${property.id}/`);
  }

  /**
   * Hides the property details page.
   * Sets the selected property detail observable to `null` and navigates away from
   * the property detail page.
   */
  hidePropertyDetails() {
    this.selectedPropertyDetail.set(null);
    this.showPropertyDetail.set(false);
  }

  getPropertyById = (id: number) => {
    return this.properties().find((p) => p.id === id);
  };

  /**
   * Sets the client ID to the provided value.
   * Updates the clientId signal with the new ID.
   * @param id - The new client ID to set.
   */
  setClientId(id: number) {
    this.clientId.set(id);
  }

  /**
   * Gets the current client ID.
   * Returns the current client ID observable's value.
   * @returns The current client ID or `null` if no client is selected.
   */
  getClientId(): number | null {
    return this.clientId();
  }

  /**
   * Creates a new client with the given data and books a unit for the given dates
   * with the given services and promo code.
   *
   * The client is created with the given data and the owner ID of the currently
   * selected property. The booking is created with the given dates, services,
   * promo code, and the ID of the just-created client. The booking status is set
   * to the given status.
   *
   * @param clientData - The data for the new client.
   * @param bookingData - The data for the booking.
   * @param status - The status of the booking, either 'pending' or 'confirmed'.
   * @returns An observable of the created booking.
   */
  bookPublicClientWithStatus(
    clientData: any,
    bookingData: {
      check_in: string;
      check_out: string;
      guests_count: number;
      unit: number;
      services: number[];
      promo_code: number | null;
    },
    status: 'pending' | 'confirmed'
  ): Observable<Booking> {
    const ownerId = this.selectedPropertyDetail()?.owner;
    const clientPayload = {
      ...clientData,
      owner_id: ownerId,
    };
    return new Observable<Booking>((observer) => {
      this.httpService
        .post<{ message: string; client: Clients }>(
          `${environment.apiBaseUrl}/api/public/create-client/`,
          clientPayload
        )
        .subscribe({
          next: (res) => {
            const client = res.client;
            if (!client?.id) {
              console.error(' Client ID is missing in response:', res);
              observer.error(new Error('Client ID is missing'));
              return;
            }
            this.setClientId(client.id);
            const bookingPayload = {
              ...bookingData,
              client: client.id,
              status: status,
            };
            this.httpService
              .post<Booking>(
                `${environment.apiBaseUrl}/api/public/create-booking/`,
                bookingPayload
              )
              .subscribe({
                next: (booking) => observer.next(booking),
                error: (bookingErr) => observer.error(bookingErr),
              });
          },
          error: (clientErr) => observer.error(clientErr),
        });
    });
  }

  /**
   * Sets the booking status popup to the given status. If the status is null,
   * the popup is closed.
   *
   * @param status - The status of the booking to show in the popup, or null to
   *   close the popup.
   */
  setBookingStatusPopup(status: BookingPopupStatus | null) {
    this.bookingStatusPopup.set(status);
  }

  /**
   * Closes the booking status popup by setting the booking status popup
   * signal to null.
   */
  closeBookingStatusPopup() {
    this.bookingStatusPopup.set(null);
  }
}
