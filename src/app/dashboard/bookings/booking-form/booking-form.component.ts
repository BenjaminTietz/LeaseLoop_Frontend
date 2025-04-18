import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { BookingsService } from '../../../services/bookings-service/bookings.service';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { MatIcon } from '@angular/material/icon';
import { FormService } from '../../../services/form-service/form.service';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Unit } from '../../../models/unit.model';
import { Property } from '../../../models/property.model';
import { ClientsService } from '../../../services/clients-service/clients.service';
import { PromocodeService } from '../../../services/promocode-service/promocode.service';
import { ServiceManagementService } from '../../../services/service-management/service-management.service';
import { Service } from '../../../models/service.model';
import { PromoCode } from '../../../models/promocode.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { UnitsService } from '../../../services/units-service/units.service';
import { Booking } from '../../../models/booking.model';
import { RouterLink } from '@angular/router';
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

  
  setMinCheckOutDate(checkInDate: string) {
    this.minCheckOutDate = new Date(new Date(checkInDate).setDate(new Date(checkInDate).getDate() + 1)).toISOString().split('T')[0];
  
    this.bookingForm.patchValue({
      check_out: '',
      property: null,
      unit: null,
      guests_count: null
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
      property: null,
      unit: null,
      guests_count: null,
    });
  
    this.showPropertyInput.set(true);
    this.showUnitInput.set(false);
    this.showGuestsInput.set(false);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

  onPropertyChange(propertyId: number | null | undefined) {
    if (propertyId == null) return;
  
    this.bookingForm.patchValue({
      unit: null,
      guests_count: null
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
      guests_count: null
    });
  
    this.showGuestsInput.set(true);
    this.showRestOfForm.set(false);
    this.nochangesMade.set(false);
  }

  onClientChange(clientId: number) {
    this.showRestOfForm.set(true);
    this.nochangesMade.set(false);
  }

  onGuestsCountChange(guestsCount: number) {
    const unitId = this.bookingForm.value.unit;
    if (unitId == null) return;
    const selectedUnit = this.unitService.units().find(u => u.id === unitId);
    if (selectedUnit && guestsCount <= selectedUnit.max_capacity) {
      this.showClient.set(true);
      this.bookingForm.patchValue({
        client: null
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

  closeForm = () => this.close.emit();

  ngOnInit(): void {
    this.bookingService.loadBooking();
    this.propertyService.loadProperties();
    this.clientService.loadClients();
    this.promoService.loadPromocodes();
    this.serviceService.loadService();
    this.unitService.loadUnits();
    console.log('Booking:', this.bookingService.selectedBooking());
    this.setDataBooking()
  }


  bookingForm = new FormBuilder().nonNullable.group({
    property: [null as number | null ,  Validators.required],
    unit: [null as number |null , Validators.required],
    client: [null as number | null],
    guests_count: [null as number | null, Validators.required],
    check_in: ['', Validators.required],
    check_out: ['', Validators.required],
    deposit_paid : [false, Validators.required],
    deposit_amount: [0],
    promo_code: [null as number| null, Validators.required],
    services: [[] as number[]],
    status: ['pending'],
  });

  checkIn = toSignal<string | null>(this.bookingForm.get('check_in')!.valueChanges, { initialValue: null });
  checkOut = toSignal<string | null>(this.bookingForm.get('check_out')!.valueChanges, { initialValue: null });

  selectedProperty = toSignal(this.bookingForm.get('property')!.valueChanges, { initialValue: null });


  setDataBooking() {
    const booking = this.bookingService.selectedBooking();
    if (booking) {
      this.bookingForm.patchValue({
        property: booking.property.id,
        unit: booking.unit.id,
        client: booking.client.id,
        guests_count: booking.guests_count,
        check_in: booking.check_in,
        check_out: booking.check_out,
        deposit_paid: booking.deposit_paid,
        deposit_amount: booking.deposit_amount,
        promo_code: booking.promo_code?.id,
        services: booking.services.map(s => s.id),
        status: booking.status
      });
  
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
  
      this.showCheckOutInput.set(true);
      this.showPropertyInput.set(true);
      this.showUnitInput.set(true);
      this.showGuestsInput.set(true);
      this.showRestOfForm.set(true);
    }
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

  onStatusChange(){
    this.nochangesMade.set(false);
  }

  guestCountExceedsCapacity() {
    const guests = this.bookingForm.get('guests_count')?.value;
    const unitId = this.bookingForm.get('unit')?.value;
    const unit = this.unitService.units().find(u => u.id === unitId);
    return unit != null && guests != null && Number(guests) > unit.max_capacity;
  }



  createBooking() {
    this.bookingService.createBooking(this.bookingForm.value);
  } 

  deleteBooking() {
   
  }

  updateBooking() {
    this.bookingService.updateBooking( this.bookingForm.value);
  }
}
