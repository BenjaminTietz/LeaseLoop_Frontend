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
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BookingStatusPopupComponent } from '../booking-status-popup/booking-status-popup.component';

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

  /**
   * Loads services for the currently selected property, and sets the check-in and
   * check-out dates, and the number of guests from the booking service.
   */
  ngOnInit() {
    const selected = this.bookingService.selectedPropertyDetail();
    if (selected?.id) {
      this.bookingService.loadServicesForProperty(selected.id);
    }
    this.checkIn.set(this.bookingService.checkInDate() ?? '');
    this.checkOut.set(this.bookingService.checkOutDate() ?? '');
    this.guests.set(this.bookingService.guestCount());
  }

  /**
   * Submits the booking form, and logs the current state of the booking to the
   * console. This currently only shows the client form, but should eventually
   * also send a booking request to the server.
   */
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

  /**
   * Handles changes to the service selection, by updating the selectedServiceIds
   * signal with the new set of selected services.
   * @param event The event emitted by the multi-select element when its selection
   * changes.
   */
  handleServiceSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(selectElement.selectedOptions).map(
      (opt) => +opt.value
    );
    this.selectedServiceIds.set(new Set(selectedOptions));
  }

  /**
   * Toggles the selection of a service in the list of selected services.
   *
   * @param serviceId The id of the service to be toggled.
   * @param checked Whether the service should be added to the selection (true), or removed from it (false).
   */
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

  /**
   * Handles changes to the selection of a service by toggling its selection in
   * the list of selected services. This function is called when the user checks
   * or unchecks a service in the list of available services.
   * @param event The event emitted by the checkbox element when its selection
   * changes.
   * @param serviceId The id of the service to be toggled.
   */
  onCheckboxChange(event: Event, serviceId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleServiceSelection(serviceId, checked);
  }

  /**
   * Toggles the visibility of the services selection section.
   *
   * This function is called when the user clicks the "Show" or "Hide" button
   * above the list of available services. It toggles the visibility of the
   * services selection section by updating the `showServices` signal with the
   * opposite value of the current one.
   */
  toggleServicesVisibility() {
    this.showServices.update((v) => !v);
  }

  /**
   * Applies a promo code to the booking, by validating it on the server and
   * updating the promo discount and promo code id signals if it is valid.
   *
   * @remarks
   * This function is called when the user clicks the "Apply" button next to the
   * promo code input.
   * If the promo code is invalid or expired, it sets the promo error signal to
   * an appropriate error message.
   */
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

  /**
   * Confirms a booking with the given client data and booking details.
   *
   * It first checks if the client form is valid. If not, it sets the promo error
   * signal to an appropriate error message and returns.
   *
   * If the form is valid, it creates a booking with the given details and calls
   * the `bookPublicClientWithStatus` method of the `ClientBookingService` with
   * the booking data and the status 'confirmed'.
   *
   * If the booking is successful, it sets the booking status popup to the
   * confirmed state with the booking id and a success message, and closes the
   * popup.
   *
   * If the booking fails, it sets the booking status popup to the unavailable
   * state with an appropriate error message, and closes the popup.
   */
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
          this.bookingService.setBookingStatusPopup({
            status: 'confirmed',
            bookingId: res.id.toString(),
            message:
              'Your booking is confirmed! Please check your email for details.',
          });
          console.log('Booking confirmed:', res);
          this.closePopup();
        },
        error: (err) => {
          this.closePopup();
          this.bookingService.setBookingStatusPopup({
            status: 'unavailable',
            message:
              'The selected unit is no longer available. Please choose another one.',
          });
        },
      });
  }

  /**
   * Sends a booking request with the given client data and booking details.
   *
   * It first checks if the client form is valid. If not, it sets the promo error
   * signal to an appropriate error message and returns.
   *
   * If the form is valid, it creates a booking with the given details and calls
   * the `bookPublicClientWithStatus` method of the `ClientBookingService` with
   * the booking data and the status 'pending'.
   *
   * If the booking is successful, it sets the booking status popup to the
   * pending state with the booking id and a success message, and closes the
   * popup.
   *
   * If the booking fails, it sets the booking status popup to the unavailable
   * state with an appropriate error message, and closes the popup.
   */
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
          this.bookingService.setBookingStatusPopup({
            status: 'pending',
            bookingId: res.id.toString(),
            message:
              'Your booking request has been sent. We’ll get back to you shortly!',
          });
          this.closePopup();
        },
        error: (err) => {
          this.closePopup();
          this.bookingService.setBookingStatusPopup({
            status: 'unavailable',
            message:
              'The selected unit is no longer available. Please choose another one.',
          });
        },
      });
  }
}
