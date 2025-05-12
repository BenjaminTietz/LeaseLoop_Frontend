import { Component, inject } from '@angular/core';
import { NavigatorService } from '../../../services/navigator/navigator.service';
import { CommonModule } from '@angular/common';
import { ClientBookingService } from '../../../services/client-booking/client-booking.service';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
})
export class LandingFooterComponent {
  navigator = inject(NavigatorService);
  bookingService = inject(ClientBookingService);
}
