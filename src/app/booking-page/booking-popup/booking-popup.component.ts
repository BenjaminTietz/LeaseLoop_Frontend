import {
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Unit } from '../../models/unit.model';
import { CommonModule } from '@angular/common';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { Service } from '../../models/service.model';
import { effect } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-booking-popup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './booking-popup.component.html',
  styleUrl: './booking-popup.component.scss',
  animations: [
    trigger('fadeExpand', [
      state('void', style({ opacity: 0, transform: 'scaleY(0)' })),
      state('*', style({ opacity: 1, transform: 'scaleY(1)' })),
      transition('void <=> *', animate('250ms ease-in-out')),
    ]),
  ],
})
export class BookingPopupComponent implements OnInit {
  @Input({ required: true }) unit!: Unit;
  @Input({ required: true }) closePopup!: () => void;
  bookingService = inject(ClientBookingService);

  property = this.bookingService.selectedPropertyDetail();

  checkIn = signal<string>('');
  checkOut = signal<string>('');
  guests = signal<number>(1);

  showServices = signal<boolean>(false);
  selectedServiceIds = signal<Set<number>>(new Set());
  private loadedPropertyIds = new Set<number>();

  ngOnInit() {
    const selected = this.bookingService.selectedPropertyDetail();
    if (selected?.id) {
      console.log('ngOnInit: Lade Services einmalig');
      this.bookingService.loadServicesForProperty(selected.id);
    }
    this.checkIn.set(this.bookingService.checkInDate() ?? '');
    this.checkOut.set(this.bookingService.checkOutDate() ?? '');
    this.guests.set(this.bookingService.guestCount());
  }

  totalPrice = computed(() => {
    const inDate = new Date(this.checkIn());
    const outDate = new Date(this.checkOut());
    const guests = this.guests();
    const nights = Math.max((+outDate - +inDate) / (1000 * 60 * 60 * 24), 0);
    const selectedServiceIds = this.selectedServiceIds();

    const selectedServices = this.bookingService
      .services()
      .filter((service) => selectedServiceIds.has(service.id));

    const serviceTotal = selectedServices.reduce((sum, s) => {
      switch (s.type) {
        case 'per_day':
          return sum + s.price * nights;
        case 'one_time':
          return sum + s.price;
        default:
          return sum;
      }
    }, 0);

    return (
      this.unit.price_per_night * nights +
      Math.max(0, guests - this.unit.capacity) *
        this.unit.price_per_extra_person *
        nights +
      serviceTotal
    );
  });

  submitBooking() {
    console.log('Submitting booking:', {
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
      guests: this.guests(),
      total: this.totalPrice(),
      services: Array.from(this.selectedServiceIds()),
    });
  }

  handleServiceSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(selectElement.selectedOptions).map(
      (opt) => +opt.value
    );
    this.selectedServiceIds.set(new Set(selectedOptions));
  }

  trackById(index: number, item: Service | undefined) {
    return item?.id ?? index;
  }

  toggleServiceSelection(serviceId: number, checked: boolean) {
    const current = this.selectedServiceIds();
    const updated = new Set(current);

    if (checked) {
      updated.add(serviceId);
    } else {
      updated.delete(serviceId);
    }

    this.selectedServiceIds.set(updated);
  }

  onCheckboxChange(event: Event, serviceId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleServiceSelection(serviceId, checked);
  }
  toggleServicesVisibility() {
    this.showServices.update((v) => !v);
  }
}
