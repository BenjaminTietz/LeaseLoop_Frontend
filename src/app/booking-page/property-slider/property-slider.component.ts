import { Component, computed, inject, signal } from '@angular/core';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-slider.component.html',
  styleUrl: './property-slider.component.scss',
})
export class PropertySliderComponent {
  bookingService = inject(ClientBookingService);
  index = signal(0);

  properties = this.bookingService.properties;

  current = computed(() => this.properties()[this.index()]);

  next() {
    this.index.set((this.index() + 1) % this.properties().length);
  }

  prev() {
    this.index.set(
      (this.index() - 1 + this.properties().length) % this.properties().length
    );
  }

  bookNow() {
    this.bookingService.selectProperty(this.current().id);
  }
}
