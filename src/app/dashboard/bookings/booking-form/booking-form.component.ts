import { Component, computed, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { BookingsService } from '../../../services/bookings-service/bookings.service';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { MatIcon } from '@angular/material/icon';
import { FormService } from '../../../services/form-service/form.service';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Unit } from '../../../models/unit.model';
import { Property } from '../../../models/property.model';
import { ClientsService } from '../../../services/clients-service/clients.service';
import { PromocodeService } from '../../../services/promocode-service/promocode.service';
import { ServiceManagementService } from '../../../services/service-management/service-management.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { UnitsService } from '../../../services/units-service/units.service';
import { RouterLink } from '@angular/router';
import { Booking } from '../../../models/booking.model';
@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ProgressBarComponent, MatIcon, ClickOutsideDirective, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent {
  @Output() close = new EventEmitter();
  bookingService = inject(BookingsService)
  formService = inject(FormService);
  propertyService = inject(PropertiesService);
  clientService = inject(ClientsService);
  promoService = inject(PromocodeService)
  serviceService = inject(ServiceManagementService)
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
    return this.clientService.clients().filter(c =>
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

  filteredServicesByProperties = computed(() => {
    const selectedProperty = this.bookingForm.get('property')?.value;
    const services = this.serviceService.services();

    if (selectedProperty) {
      return services.filter(service => service.property === selectedProperty);
    } else {
      return services;
    }
  });

  constructor() {
    this.loadAllData();
    effect(() => {
          if (this.bookingService.successful()) {
            this.formService.resetForm(this.bookingForm);
            this.closeForm();
          }
        }, { allowSignalWrites: true });
  }

  
  setMinCheckOutDate(checkInDate: string) {
    this.minCheckOutDate = new Date(new Date(checkInDate).setDate(new Date(checkInDate).getDate() + 1)).toISOString().split('T')[0];
  
    this.bookingForm.patchValue({
      check_out: '',
      property: 0,
      unit: 0,
      guests_count: 0
    });
  
    this.showCheckOutInput.set(true);
    this.showPropertyInput.set(false);
    this.showUnitInput.set(false);
    this.showGuestsInput.set(false);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

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

  onPropertyChange(propertyId: number | null | undefined) {
    if (propertyId == null) return;
  
    this.bookingForm.patchValue({
      unit: 0,
      guests_count: 0
    });
  
    const checkInDate = this.checkIn();
    const checkOutDate = this.checkOut();
  
    if (!checkInDate || !checkOutDate) return;
  
    const allBookings = this.bookingService.bookings() || [];
  
    const selectedBookingId = this.bookingService.selectedBooking()?.id;

    const availableUnits = this.unitService.units().filter(unit =>
      unit.property.id === propertyId &&
      !allBookings.some(booking =>
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

  onUnitChange(unitId: number) {
    this.bookingForm.patchValue({
      guests_count: 0
    });
  
    this.showGuestsInput.set(true);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

  onClientChange(clientId: number) {
    this.showRestOfForm.set(true);
    this.nochangesMade.set(false);
    this.clientTyped.set(true);
  }

  onGuestsCountChange(guestsCount: number) {
    const unitId = this.bookingForm.value.unit;
    if (unitId == null) return;
    const selectedUnit = this.unitService.units().find(u => u.id === unitId);
    if (selectedUnit && guestsCount <= selectedUnit.max_capacity) {
      this.showClient.set(true);
      this.bookingForm.patchValue({
        client: 0
      })
    } else {
      this.showClient.set(false);
    }
    this.nochangesMade.set(false);
  }

  filterAvailableProperties(checkIn: string, checkOut: string) {
    const selectedBookingId = this.bookingService.selectedBooking()?.id;

    const availableUnitsInRange = this.unitService.units().filter(unit => {
      const overlapping = this.bookingService.bookings().find(b =>
        b.id !== selectedBookingId &&
        b.unit.id === unit.id &&
        new Date(b.check_in) < new Date(checkOut) &&
        new Date(b.check_out) > new Date(checkIn)
      );
      return !overlapping;
    });
  
    const propertyIds = [...new Set(availableUnitsInRange.map(u => u.property.id))];
  
    const matchingProperties = this.propertyService.properties().filter(p =>
      propertyIds.includes(p.id)
    );
  
    this.availableProperties.set(matchingProperties);
    this.showPropertyInput.set(matchingProperties.length > 0);
  }

  filterUnitsForGuests(propertyId: number, guests: number, checkIn: string, checkOut: string) {
    const units = this.unitService.units().filter(unit =>
      unit.property.id === propertyId &&
      unit.max_capacity >= guests &&
      !this.bookingService.bookings().some(b =>
        b.unit.id === unit.id &&
        new Date(b.check_in) < new Date(checkOut) &&
        new Date(b.check_out) > new Date(checkIn)
      )
    );
    this.availableUnits.set(units);
  }

  closeForm = () => {
    if(this.bookingService.sending()) return
    this.close.emit()
  };

  ngOnInit(): void {
    this.bookingService.sending.set(false);
    this.setDataBooking()
  }

  loadAllData(){
    this.bookingService.loadPaginatedBookings(this.bookingService.currentPage()); 
    this.propertyService.loadProperties();
    this.clientService.loadClients();
    this.promoService.loadPromocodes();
    this.serviceService.loadService();
    this.unitService.loadUnits();
    setTimeout(() => {
      console.log(this.serviceService.services());
    }, 3000);
    
    
  }


  bookingForm = new FormBuilder().nonNullable.group({
    property: [this.bookingService.selectedBooking()?.property.id || 0 ,  Validators.required],
    unit: [this.bookingService.selectedBooking()?.unit.id || 0 , Validators.required],
    client: [this.bookingService.selectedBooking()?.client.id || 0, Validators.required],
    guests_count: [this.bookingService.selectedBooking()?.guests_count || 0, Validators.required],
    check_in: [this.bookingService.selectedBooking()?.check_in || '', Validators.required],
    check_out: [this.bookingService.selectedBooking()?.check_out || '', Validators.required],
    deposit_paid : [this.bookingService.selectedBooking()?.deposit_paid || false, Validators.required],
    deposit_amount: [this.bookingService.selectedBooking()?.deposit_amount || 0, Validators.min(0)],
    promo_code: [this.bookingService.selectedBooking()?.promo_code?.id ?? null, Validators.nullValidator],
    services: [this.bookingService.selectedBooking()?.services.map(s => s.id) || []],
    status: [this.bookingService.selectedBooking()?.status || 'pending', Validators.required],
  });

  checkIn = toSignal<string | null>(this.bookingForm.get('check_in')!.valueChanges, { initialValue: null });
  checkOut = toSignal<string | null>(this.bookingForm.get('check_out')!.valueChanges, { initialValue: null });

  selectedProperty = toSignal(this.bookingForm.get('property')!.valueChanges, { initialValue: null });

  optionalSelectValidator() {
    return (control: AbstractControl) => {
      return control.value !== null && control.value >= 0
        ? null
        : { required: true };
    };
  }

  setDataBooking() {
    const booking = this.bookingService.selectedBooking();
    if (booking) {
      const properties = this.propertyService.properties();
      if (!properties.some(p => p.id === booking.property.id)) {
        this.availableProperties.set([...properties, booking.property]);
      } else {
        this.availableProperties.set(properties);
      }
      const units = this.unitService.units();
      if (!units.some(u => u.id === booking.unit.id)) {
        this.availableUnits.set([...units, booking.unit]);
      } else {
        this.availableUnits.set(units);
      }
  
      this.showFullForm();
    }
  }

  showFullForm(){
    this.showCheckOutInput.set(true);
      this.showPropertyInput.set(true);
      this.showClient.set(true);
      this.showUnitInput.set(true);
      this.showGuestsInput.set(true);
      this.showRestOfForm.set(true);
  }
  


  onServiceChange(event: Event, serviceId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    const services = this.bookingForm.value.services || [];
    this.nochangesMade.set(false);
  
    if (checked) {
      this.bookingForm.get('services')?.setValue([...services, serviceId]);
    } else {
      this.bookingForm.get('services')?.setValue(services.filter((id: number) => id !== serviceId));
    }
  }

  onValueChange(){
    this.nochangesMade.set(false);
  }


  guestCountExceedsCapacity() {
    const guests = this.bookingForm.get('guests_count')?.value;
    const unitId = this.bookingForm.get('unit')?.value;
    const unit = this.unitService.units().find(u => u.id === unitId);
    return unit != null && guests != null && Number(guests) > unit.max_capacity;
  }

  onClientInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.clientInput.set(value);
  }
  
  selectClient(client: { id: number, first_name: string, last_name: string }) {
    this.bookingForm.patchValue({ client: client.id });
    this.clientInput.set(`${client.first_name} ${client.last_name}`);
    this.clientDropdownOpen = false;
    this.onClientChange(client.id);
  }

  closeClientDropdown = () => {
    this.clientDropdownOpen = false;
  }

  createBooking() {
    this.bookingService.createBooking(this.bookingForm.value);
  } 

  deleteBooking() {
    this.bookingService.deleteBooking();
  }

  updateBooking() {
    this.bookingService.updateBooking( this.bookingForm.value);
  }

  ngOnDestroy(){
    this.loadAllData()
    this.bookingService.selectedBooking.set(null);
    this.bookingService.successful.set(false);
    this.bookingService.sending.set(false);
  }

  getClientInputValue() {
    return this.clientTyped() ? this.clientInput() : this.initialClientInput();
  } 
}
