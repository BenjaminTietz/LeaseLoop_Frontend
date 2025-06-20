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
  FormsModule,
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
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
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
  formBuilder = inject(FormBuilder);

  property = this.bookingService.selectedPropertyDetail();

  checkIn = signal<string>('');
  checkOut = signal<string>('');
  guests = signal<number>(1);
  usedPromoCode = signal<string>('');
  promoDiscount = signal<number>(0);
  promoError = signal<string | null>(null);
  promoCodeId = signal<number | null>(null);
  showServices = signal<boolean>(false);
  selectedServiceIds = signal<Set<number>>(new Set());
  showClientForm = signal<boolean>(false);

  private loadedPropertyIds = new Set<number>();

  clientForm: FormGroup = this.formBuilder.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: this.formBuilder.group({
      street: ['', Validators.required],
      house_number: ['', Validators.required],
      postal_code: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\s()-]{6,20}$/)],
      ],
    }),
  });

  ngOnInit() {
    const selected = this.bookingService.selectedPropertyDetail();
    if (selected?.id) {
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

    const baseTotal =
      this.unit.price_per_night * nights +
      Math.max(0, guests - this.unit.capacity) *
        this.unit.price_per_extra_person *
        nights +
      serviceTotal;

    const discount = this.promoDiscount();
    const discountedTotal = baseTotal - (baseTotal * discount) / 100;

    return Math.max(0, discountedTotal);
  });

  submitBooking() {
    console.log('Submitting booking:', {
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
      guests: this.guests(),
      total: this.totalPrice(),
      services: Array.from(this.selectedServiceIds()),
    });
    this.showClientForm.set(true);
  }

  handleServiceSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(selectElement.selectedOptions).map(
      (opt) => +opt.value
    );
    this.selectedServiceIds.set(new Set(selectedOptions));
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

  applyPromoCode() {
    const code = this.usedPromoCode().trim();
    if (!code) {
      this.promoError.set('Please enter a promo code.');
      return;
    }

    this.promoError.set(null);
    this.bookingService.validatePromoCode(code).subscribe({
      next: (promo) => {
        this.promoDiscount.set(promo.discount_percent);
        this.promoCodeId.set(promo.id);
        console.log(`Promo applied: -${promo.discount_percent}%`);
      },
      error: (err) => {
        this.promoDiscount.set(0);
        this.promoError.set('Invalid or expired promo code.');
      },
    });
  }

  confirmBooking() {
    if (this.clientForm.invalid) {
      this.promoError.set('Please fill out all required fields.');
      return;
    }

    const clientData = this.clientForm.getRawValue();
    const bookingData = {
      check_in: this.checkIn(),
      check_out: this.checkOut(),
      guests_count: this.guests(),
      unit: this.unit.id,
      services: Array.from(this.selectedServiceIds()),
      promo_code: this.promoCodeId() ?? null,
    };

    this.bookingService
      .bookPublicClientWithStatus(clientData, bookingData, 'confirmed')
      .subscribe({
        next: (res) => {
          console.log('Booking confirmed:', res);
          this.closePopup(); // TODO: Show success message ask for payment
        },
        error: (err) => {
          console.error('Booking failed:', err);
          this.promoError.set(
            err.error?.error || 'Booking failed. Please try again.'
          );
        },
      });
  }

  sendRequest() {
    if (this.clientForm.invalid) {
      this.promoError.set('Please fill out all required fields.');
      return;
    }

    const clientData = this.clientForm.getRawValue();
    const bookingData = {
      check_in: this.checkIn(),
      check_out: this.checkOut(),
      guests_count: this.guests(),
      unit: this.unit.id,
      services: Array.from(this.selectedServiceIds()),
      promo_code: this.promoCodeId() ?? null,
    };
    this.bookingService
      .bookPublicClientWithStatus(clientData, bookingData, 'pending')
      .subscribe({
        next: (res) => {
          console.log('Booking request sent:', res);
          this.closePopup(); // TODO: Show success message show request status
        },
        error: (err) => {
          console.error('Booking request failed:', err);
          this.promoError.set(
            err.error?.error || 'Request failed. Please try again.'
          );
        },
      });
  }
}
