import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ImageSliderComponent } from '../../shared/booking-page/image-slider/image-slider.component';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { BookingsService } from '../../services/bookings-service/bookings.service';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';

@Component({
  selector: 'app-property-detail-view',
  standalone: true,
  imports: [CommonModule, ImageSliderComponent],
  templateUrl: './property-detail-view.component.html',
  styleUrl: './property-detail-view.component.scss',
})
export class PropertyDetailViewComponent {
  navigator = inject(NavigatorService);
  bookingService = inject(ClientBookingService);
  route = inject(ActivatedRoute);

  propertyId = toSignal(
    this.route.paramMap.pipe(map((p) => +p.get('propertyId')!))
  );
  property = computed(() => {
    const id = this.propertyId();
    return typeof id === 'number' && !isNaN(id)
      ? this.bookingService.getPropertyById(id)
      : undefined;
  });
}
