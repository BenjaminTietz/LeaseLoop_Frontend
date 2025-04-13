import { Component, EventEmitter, inject, Output } from '@angular/core';
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
    console.log(this.promoService.promocodes());
    
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
    property: [null, Validators.required],
    unit: [null, Validators.required],
    client: [null, Validators.required],
    guests_amount: [0, Validators.required],
    check_in: [null, Validators.required],
    check_out: [null, Validators.required],
    deposit_paid : [false, Validators.required],
    deposit_amount: [0],
    promocode: [null],
    services: [[]]
  });
}
