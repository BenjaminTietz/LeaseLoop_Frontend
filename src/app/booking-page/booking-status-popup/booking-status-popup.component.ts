import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject } from '@angular/core';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-booking-status-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-status-popup.component.html',
  styleUrl: './booking-status-popup.component.scss',
})
export class BookingStatusPopupComponent implements OnInit {
  bookingService = inject(ClientBookingService);
  navigator = inject(NavigatorService);
  @Input() status!: 'confirmed' | 'pending' | 'unavailable';
  @Input() bookingId?: string;

  title = computed(() => {
    switch (this.status) {
      case 'pending':
        return 'Booking request received';
      case 'confirmed':
        return 'Booking confirmed';
      case 'unavailable':
        return 'Unit not available';
      default:
        return '';
    }
  });

  message = computed(() => {
    switch (this.status) {
      case 'pending':
        return 'Please wait, we will contact you soon and confirm your booking.';
      case 'confirmed':
        return `Please pay the deposit into the following bank account using your booking ID: ${
          this.bookingId || 'N/A'
        }. Check your email for more information.`;
      case 'unavailable':
        return 'Unfortunately, the selected unit is no longer available. Please try another one.';
      default:
        return '';
    }
  });

  /**
   * Closes the booking status popup after 3 seconds if the booking status is 'unavailable'.
   * This is a temporary solution until we have a proper redirect to a search page.
   */
  ngOnInit(): void {
    if (this.status === 'unavailable') {
      setTimeout(() => {
        this.navigator.navigateTo('/');
        this.bookingService.closeBookingStatusPopup();
      }, 3000);
    }
  }

  /**
   * Closes the booking status popup by calling the booking service method.
   */
  close() {
    this.bookingService.closeBookingStatusPopup();
  }
}
