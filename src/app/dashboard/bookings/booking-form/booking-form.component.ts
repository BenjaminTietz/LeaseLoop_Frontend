import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { BookingsService } from '../../../services/bookings-service/bookings.service';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';
import { MatIcon } from '@angular/material/icon';
import { FormService } from '../../../services/form-service/form.service';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Unit } from '../../../models/unit.model';
import { Property } from '../../../models/property.model';
import { ClientsService } from '../../../services/clients-service/clients.service';
import { PromocodeService } from '../../../services/promocode-service/promocode.service';
import { ServiceManagementService } from '../../../services/service-management/service-management.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { UnitsService } from '../../../services/units-service/units.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    ProgressBarComponent,
    MatIcon,
    ClickOutsideDirective,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
})
export class BookingFormComponent {
  @Output() close = new EventEmitter();
  bookingService = inject(BookingsService);
  formService = inject(FormService);
  propertyService = inject(PropertiesService);
  clientService = inject(ClientsService);
  promoService = inject(PromocodeService);
  serviceService = inject(ServiceManagementService);
  unitService = inject(UnitsService);
  clientInput = signal('');
  clientTyped = signal(false);
  initialClientInput = computed(() => {
    const selected = this.bookingService.selectedBooking();
    if (selected && selected.client) {
      return `${selected.client.first_name} ${selected.client.last_name}, ${selected.client.email}`;
    }
    return '';
  });
  filteredClients = computed(() => {
    const search = this.clientInput().toLowerCase();
    return this.clientService
      .clients()
      .filter((c) =>
        (c.first_name + ' ' + c.last_name).toLowerCase().includes(search)
      );
  });
  clientDropdownOpen = false;

  minCheckInDate = new Date().toISOString().split('T')[0];
  minCheckOutDate = new Date().toISOString().split('T')[0];

  availableProperties = signal<Property[]>([]);
  availableUnits = signal<Unit[]>([]);

  showCheckOutInput = signal(false);
  showPropertyInput = signal(false);
  showUnitInput = signal(false);
  showGuestsInput = signal(false);
  showClient = signal(false);
  showRestOfForm = signal(false);
  nochangesMade = signal(true);

  bookingForm = new FormBuilder().nonNullable.group({
    property: [
      this.bookingService.selectedBooking()?.property.id || 0,
      Validators.required,
    ],
    unit: [
      this.bookingService.selectedBooking()?.unit.id || 0,
      Validators.required,
    ],
    client: [
      this.bookingService.selectedBooking()?.client.id || 0,
      Validators.required,
    ],
    guests_count: [
      this.bookingService.selectedBooking()?.guests_count || 0,
      Validators.required,
    ],
    check_in: [
      this.bookingService.selectedBooking()?.check_in || '',
      Validators.required,
    ],
    check_out: [
      this.bookingService.selectedBooking()?.check_out || '',
      Validators.required,
    ],
    deposit_paid: [
      this.bookingService.selectedBooking()?.deposit_paid || false,
      Validators.required,
    ],
    deposit_amount: [
      this.bookingService.selectedBooking()?.deposit_amount || 0,
      Validators.min(0),
    ],
    promo_code: [
      this.bookingService.selectedBooking()?.promo_code?.id ?? null,
      Validators.nullValidator,
    ],
    services: [
      this.bookingService.selectedBooking()?.services.map((s) => s.id) || [],
    ],
    status: [
      this.bookingService.selectedBooking()?.status || 'pending',
      Validators.required,
    ],
  });

  checkIn = toSignal<string | null>(
    this.bookingForm.get('check_in')!.valueChanges,
    { initialValue: null }
  );
  checkOut = toSignal<string | null>(
    this.bookingForm.get('check_out')!.valueChanges,
    { initialValue: null }
  );

  selectedProperty = toSignal(this.bookingForm.get('property')!.valueChanges, {
    initialValue: null,
  });

  filteredServicesByProperties = computed(() => {
    const selectedProperty = this.bookingForm.get('property')?.value;
    const services = this.serviceService.services();

    if (selectedProperty) {
      return services.filter(
        (service) => service.property === selectedProperty
      );
    } else {
      return services;
    }
  });

  /**
   * Lifecycle hook that is called after the component has been initialized.
   * Loads all the needed data for the form and sets up the effect that will be triggered
   * when the booking is successfully created.
   */
  constructor() {
    this.loadAllData();
    effect(
      () => {
        if (this.bookingService.successful()) {
          this.formService.resetForm(this.bookingForm);
          this.closeForm();
        }
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Initializes the component.
   * Sets the sending signal to false and sets the data to be edited.
   */
  ngOnInit(): void {
    this.bookingService.sending.set(false);
    this.setDataBooking();
  }

  /**
   * Updates the minimum check-out date based on the provided check-in date.
   * Resets relevant form fields and UI signals.
   *
   * @param checkInDate - The selected check-in date used to set the minimum check-out date.
   */
  setMinCheckOutDate(checkInDate: string) {
    this.minCheckOutDate = new Date(
      new Date(checkInDate).setDate(new Date(checkInDate).getDate() + 1)
    )
      .toISOString()
      .split('T')[0];
    this.bookingForm.patchValue({
      check_out: '',
      property: 0,
      unit: 0,
      guests_count: 0,
    });
    this.showCheckOutInput.set(true);
    this.showPropertyInput.set(false);
    this.showUnitInput.set(false);
    this.showGuestsInput.set(false);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

  /**
   * Handles changes to the check-out date.
   * Checks if a check-in date is set, and if so, filters available properties
   * based on the selected check-in and check-out dates.
   * Resets certain form fields and UI signals to their default states.
   *
   * @param checkOutDate - The newly selected check-out date.
   */
  onCheckOutChange(checkOutDate: string) {
    const checkInDate = this.checkIn();
    if (!checkInDate) return;
    this.filterAvailableProperties(checkInDate, checkOutDate);
    this.bookingForm.patchValue({
      property: 0,
      unit: 0,
      guests_count: 0,
    });
    this.showPropertyInput.set(true);
    this.showUnitInput.set(false);
    this.showGuestsInput.set(false);
    this.showClient.set(false);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

  /**
   * Handles changes to the property.
   * Checks if a check-in and check-out date is set, and if so, filters available units
   * based on the selected check-in and check-out dates and the selected property.
   * Resets certain form fields and UI signals to their default states.
   *
   * @param propertyId - The newly selected property's id.
   */
  onPropertyChange(propertyId: number | null | undefined) {
    if (propertyId == null) return;
    this.bookingForm.patchValue({
      unit: 0,
      guests_count: 0,
    });
    const checkInDate = this.checkIn();
    const checkOutDate = this.checkOut();
    if (!checkInDate || !checkOutDate) return;
    const allBookings = this.bookingService.bookings() || [];
    const selectedBookingId = this.bookingService.selectedBooking()?.id;
    const availableUnits = this.unitService
      .units()
      .filter(
        (unit) =>
          unit.property.id === propertyId &&
          !allBookings.some(
            (booking) =>
              booking.id !== selectedBookingId &&
              booking.unit.id === unit.id &&
              new Date(booking.check_in) < new Date(checkOutDate) &&
              new Date(booking.check_out) > new Date(checkInDate)
          )
      );
    this.availableUnits.set(availableUnits);
    this.showUnitInput.set(availableUnits.length > 0);
    this.showGuestsInput.set(false);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

  /**
   * Handles changes to the unit.
   * Resets the guests count and enables the guest count input.
   * Disables the rest of the form and sets the nochangesMade signal to false.
   * @param unitId - The newly selected unit's id.
   */
  onUnitChange(unitId: number) {
    this.bookingForm.patchValue({
      guests_count: 0,
    });
    this.showGuestsInput.set(true);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

  /**
   * Handles changes to the client.
   * Enables the rest of the form and sets the nochangesMade signal to false.
   * @param clientId - The newly selected client's id.
   */
  onClientChange(clientId: number) {
    this.showRestOfForm.set(true);
    this.nochangesMade.set(false);
    this.clientTyped.set(true);
  }

  /**
   * Handles changes to the guest count.
   * Checks if a unit is selected, and if so, enables the client input if the guest count is less than or equal to the unit's max capacity.
   * Disables the client input and resets its value if the guest count exceeds the unit's max capacity.
   * Sets the nochangesMade signal to false in either case.
   * @param guestsCount - The newly selected guest count.
   */
  onGuestsCountChange(guestsCount: number) {
    const unitId = this.bookingForm.value.unit;
    if (unitId == null) return;
    const selectedUnit = this.unitService.units().find((u) => u.id === unitId);
    if (selectedUnit && guestsCount <= selectedUnit.max_capacity) {
      this.showClient.set(true);
      this.bookingForm.patchValue({
        client: 0,
      });
    } else {
      this.showClient.set(false);
    }
    this.nochangesMade.set(false);
  }

  /**
   * Filters available properties based on the selected check-in and check-out dates.
   * First, it filters the units that do not overlap with any existing bookings (except the selected booking itself, if any).
   * Then, it collects the property ids of the remaining units and filters the properties that match those ids.
   * Finally, it updates the available properties signal and sets the showPropertyInput signal based on whether there are any matching properties.
   * @param checkIn - The selected check-in date.
   * @param checkOut - The selected check-out date.
   */
  filterAvailableProperties(checkIn: string, checkOut: string) {
    const selectedBookingId = this.bookingService.selectedBooking()?.id;
    const availableUnitsInRange = this.unitService.units().filter((unit) => {
      const overlapping = this.bookingService
        .bookings()
        .find(
          (b) =>
            b.id !== selectedBookingId &&
            b.unit.id === unit.id &&
            new Date(b.check_in) < new Date(checkOut) &&
            new Date(b.check_out) > new Date(checkIn)
        );
      return !overlapping;
    });
    const propertyIds = [
      ...new Set(availableUnitsInRange.map((u) => u.property.id)),
    ];
    const matchingProperties = this.propertyService
      .properties()
      .filter((p) => propertyIds.includes(p.id));
    this.availableProperties.set(matchingProperties);
    this.showPropertyInput.set(matchingProperties.length > 0);
  }

  /**
   * Filters available units based on the selected property, guest count, and dates.
   * It first filters the units that belong to the selected property and have a max capacity that is greater than or equal to the guest count.
   * Then, it filters the remaining units to exclude any that overlap with existing bookings (except the selected booking itself, if any).
   * Finally, it updates the available units signal.
   * @param propertyId - The selected property's id.
   * @param guests - The selected guest count.
   * @param checkIn - The selected check-in date.
   * @param checkOut - The selected check-out date.
   */
  filterUnitsForGuests(
    propertyId: number,
    guests: number,
    checkIn: string,
    checkOut: string
  ) {
    const units = this.unitService
      .units()
      .filter(
        (unit) =>
          unit.property.id === propertyId &&
          unit.max_capacity >= guests &&
          !this.bookingService
            .bookings()
            .some(
              (b) =>
                b.unit.id === unit.id &&
                new Date(b.check_in) < new Date(checkOut) &&
                new Date(b.check_out) > new Date(checkIn)
            )
      );
    this.availableUnits.set(units);
  }

  closeForm = () => {
    if (this.bookingService.sending()) return;
    this.close.emit();
  };

  /**
   * Loads all the data for the booking form. This includes:
   * - loading the paginated bookings for the current page
   * - loading all properties
   * - loading all clients
   * - loading all promocodes
   * - loading all services
   * - loading all units
   *
   * This method is meant to be called when the component is initialized.
   */
  loadAllData() {
    this.bookingService.loadPaginatedBookings(
      this.bookingService.currentPage()
    );
    this.propertyService.loadProperties();
    this.clientService.loadClients();
    this.promoService.loadPromocodes();
    this.serviceService.loadService();
    this.unitService.loadUnits();
  }

  /**
   * A validator that marks a select control as valid if the selected value is not null and is greater than or equal to 0.
   * @returns An object with a required property set to true if the control is invalid, or null if valid.
   */
  optionalSelectValidator() {
    return (control: AbstractControl) => {
      return control.value !== null && control.value >= 0
        ? null
        : { required: true };
    };
  }

  /**
   * Sets the data for the booking form to the selected booking.
   * If the selected booking's property or unit is not found in the available ones,
   * it adds them to the list. If they are already in the list, it just loads the
   * available ones.
   * Finally, it sets the form to show all the fields.
   */
  setDataBooking() {
    const booking = this.bookingService.selectedBooking();
    if (booking) {
      const properties = this.propertyService.properties();
      if (!properties.some((p) => p.id === booking.property.id)) {
        this.availableProperties.set([...properties, booking.property]);
      } else {
        this.availableProperties.set(properties);
      }
      const units = this.unitService.units();
      if (!units.some((u) => u.id === booking.unit.id)) {
        this.availableUnits.set([...units, booking.unit]);
      } else {
        this.availableUnits.set(units);
      }

      this.showFullForm();
    }
  }

  /**
   * Shows all the fields of the booking form.
   *
   * This method is used in conjuction with setDataBooking() to show all the fields
   * of the booking form when the selected booking is not null.
   */
  showFullForm() {
    this.showCheckOutInput.set(true);
    this.showPropertyInput.set(true);
    this.showClient.set(true);
    this.showUnitInput.set(true);
    this.showGuestsInput.set(true);
    this.showRestOfForm.set(true);
  }

  /**
   * Handles changes to the services selection.
   * Updates the form's services array based on the checkbox state for a particular service.
   * Sets the nochangesMade signal to false.
   *
   * @param event - The event triggered by changing the service checkbox.
   * @param serviceId - The ID of the service that was toggled.
   */
  onServiceChange(event: Event, serviceId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    const services = this.bookingForm.value.services || [];
    this.nochangesMade.set(false);
    if (checked) {
      this.bookingForm.get('services')?.setValue([...services, serviceId]);
    } else {
      this.bookingForm
        .get('services')
        ?.setValue(services.filter((id: number) => id !== serviceId));
    }
  }

  /**
   * Handles changes to the booking form's promo code or services.
   *
   * Sets the nochangesMade signal to false.
   */
  onValueChange() {
    this.nochangesMade.set(false);
  }

  /**
   * Checks whether the number of guests exceeds the maximum capacity of the selected unit.
   *
   * Retrieves the current guest count and the selected unit's ID from the booking form.
   * Finds the corresponding unit and compares its max capacity with the guest count.
   *
   * @returns True if the guest count exceeds the unit's max capacity, otherwise false.
   */
  guestCountExceedsCapacity() {
    const guests = this.bookingForm.get('guests_count')?.value;
    const unitId = this.bookingForm.get('unit')?.value;
    const unit = this.unitService.units().find((u) => u.id === unitId);
    return unit != null && guests != null && Number(guests) > unit.max_capacity;
  }

  /**
   * Handles input events for the client search input.
   *
   * Retrieves the current value of the input element and updates the clientInput signal.
   * @param event - The input event triggered by the client search input.
   */
  onClientInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.clientInput.set(value);
  }

  /**
   * Handles selection of a client from the client dropdown.
   * @param client - The selected client object containing the ID, first name, and last name.
   * Patches the booking form with the client's ID and updates the clientInput signal with the client's name.
   * Closes the client dropdown.
   * Calls onClientChange with the client's ID.
   */
  selectClient(client: { id: number; first_name: string; last_name: string }) {
    this.bookingForm.patchValue({ client: client.id });
    this.clientInput.set(`${client.first_name} ${client.last_name}`);
    this.clientDropdownOpen = false;
    this.onClientChange(client.id);
  }

  closeClientDropdown = () => {
    this.clientDropdownOpen = false;
  };

  /**
   * Creates a new booking.
   *
   * Submits the booking form values to the booking service's createBooking method.
   * @see ClientBookingService.createBooking
   */
  createBooking() {
    this.bookingService.createBooking(this.bookingForm.value);
  }

  /**
   * Deletes the currently selected booking.
   *
   * Calls the booking service's deleteBooking method, which sends a request to the server to delete the booking.
   * @see ClientBookingService.deleteBooking
   */
  deleteBooking() {
    this.bookingService.deleteBooking();
  }

  /**
   * Updates the currently selected booking.
   *
   * Submits the booking form values to the booking service's updateBooking method.
   * @see ClientBookingService.updateBooking
   */
  updateBooking() {
    this.bookingService.updateBooking(this.bookingForm.value);
  }

  /**
   * Resets the component state when it is destroyed.
   *
   * Ensures that the booking service's state is reset to its initial state
   * (i.e. no selected booking, no success, no pending request) when the
   * component is destroyed. This is necessary to prevent the booking service
   * from retaining state from the previous booking when the user navigates
   * to a different booking.
   */
  ngOnDestroy() {
    this.loadAllData();
    this.bookingService.selectedBooking.set(null);
    this.bookingService.successful.set(false);
    this.bookingService.sending.set(false);
  }

  /**
   * Returns the value of the client input field, or the initial value if the input
   * field is empty.
   *
   * This is used to display the client's name in the booking form when the user
   * navigates back to the booking form after selecting a client.
   * @returns The value of the client input field, or the initial value if the input
   * field is empty.
   */
  getClientInputValue() {
    return this.clientTyped() ? this.clientInput() : this.initialClientInput();
  }
}
