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
@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ProgressBarComponent, MatIcon, ClickOutsideDirective, CommonModule, ReactiveFormsModule],
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

  units: Unit[] = [];
  minCheckInDate = new Date().toISOString().split('T')[0];
  minCheckOutDate = new Date().toISOString().split('T')[0];

  
  setMinCheckOutDate(checkInDate: string) {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + 1);
    this.minCheckOutDate = date.toISOString().split('T')[0];
  }

  closeForm = () => this.close.emit();

  ngOnInit(): void {
    this.bookingService.loadBooking();
    this.propertyService.loadProperties();
    this.clientService.loadClients();
    this.promoService.loadPromocodes();
    this.serviceService.loadService();
    this.unitService.loadUnits();
    this.setUnitBasedOnProperty();
  }

  setUnitBasedOnProperty(){
    this.bookingForm.get('property')?.valueChanges.subscribe((property: Property | null) => {
      if (property) {
        this.units = property.units;
      } else {
        this.units = [];
      }
      this.bookingForm.get('unit')?.setValue(null);
    });
  }

  bookingForm = new FormBuilder().nonNullable.group({
    property: [null as Property | null, Validators.required],
    unit: [null as Unit | null, Validators.required],
    client: [null, Validators.required],
    guests_amount: [null as number | null, Validators.required],
    check_in: [null, Validators.required],
    check_out: [null, Validators.required],
    deposit_paid : [false, Validators.required],
    deposit_amount: [0],
    promocode: [null as PromoCode | null, Validators.required],
    services: [[] as Service[]],
    status: ['pending'],
  });

  checkIn = toSignal(this.bookingForm.get('check_in')!.valueChanges, { initialValue: null });
  checkOut = toSignal(this.bookingForm.get('check_out')!.valueChanges, { initialValue: null });

  selectedProperty = toSignal(this.bookingForm.get('property')!.valueChanges, { initialValue: null });


  availableProperties = computed(() => {
    const checkIn = this.checkIn();
    const checkOut = this.checkOut();
    const bookings = this.bookingService.bookings();
    const properties = this.propertyService.properties();
  
    if (!checkIn || !checkOut) {
      return properties;
    }
  
    return properties.filter(property => {
      const hasFreeUnit = property.units.some(unit =>
        !bookings.some(booking =>
          booking.unit.id === unit.id &&
          this.datesOverlap(checkIn, checkOut, booking.check_in, booking.check_out)
        )
      );
      return hasFreeUnit;
    });
  });

  availableUnits = computed(() => {
    const checkIn = this.checkIn();
    const checkOut = this.checkOut();
    const bookings = this.bookingService.bookings();
    const property = this.selectedProperty();
  
    if (!property) {
      return [];
    }
  
    if (!checkIn || !checkOut) {
      return property.units;
    }
  
    const freeUnits = property.units.filter(unit =>
      !bookings.some(booking =>
        booking.unit.id === unit.id &&
        this.datesOverlap(checkIn, checkOut, booking.check_in, booking.check_out)
      )
    );

    const selectedUnit = this.bookingForm.get('unit')?.value;
    if (selectedUnit && !freeUnits.find(u => u.id === selectedUnit.id)) {
      this.bookingForm.get('unit')?.setValue(null);
    }
  
    return freeUnits;
  });


  onServiceChange(event: Event, service: Service) {
    const checkbox = event.target as HTMLInputElement;
    const selectedServices = this.bookingForm.get('services')?.value || [];
  
    if (checkbox.checked) {
      this.bookingForm.get('services')?.setValue([...selectedServices, service]);
    } else {
      this.bookingForm.get('services')?.setValue(
        selectedServices.filter((s: Service) => s.id !== service.id)
      );
    }
  }

  get selectedServices(): Service[] {
    return this.bookingForm.get('services')?.value || [];
  }

  submitForm() {
      console.log(this.bookingForm.value)
  }


  guestsAmount = toSignal(this.bookingForm.get('guests_amount')!.valueChanges, { initialValue: null });

  hasUnitWithEnoughGuests = computed(() => {
    const guests = this.guestsAmount();
    const units = this.unitService.units();
  
    if (!guests || !units.length) {
      return false;
    }
  
    return units.some(unit => unit.max_capacity >= guests);
  });



  datesOverlap(checkInA: string, checkOutA: string, checkInB: string, checkOutB: string) {
    return checkInA < checkOutB && checkOutA > checkInB;
  }

  showGuestInput = computed(() => {
    const checkIn = this.checkIn();
    const checkOut = this.checkOut();
    const bookings = this.bookingService.bookings();
    const units = this.unitService.units();
  
    if (!checkIn || !units.length) {
      return false;
    }
  
    // if checkOut is not selected yet --> Check for free units on checkIn day only
    if (!checkOut) {
      return units.some(unit =>
        !bookings.some(booking =>
          booking.unit.id === unit.id &&
          this.datesOverlap(checkIn, checkIn, booking.check_in, booking.check_out)
        )
      );
    }
  
    // if both checkIn & checkOut are selected --> Check for units free in the whole range
    return units.some(unit =>
      !bookings.some(booking =>
        booking.unit.id === unit.id &&
        this.datesOverlap(checkIn, checkOut, booking.check_in, booking.check_out)
      )
    );
  });
}
