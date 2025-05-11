import { Component, computed, inject, Input, signal } from '@angular/core';
import { ClientBookingService } from '../../services/client-booking/client-booking.service';
import { CommonModule } from '@angular/common';
import { Unit } from '../../models/unit.model';

@Component({
  selector: 'app-unit-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unit-slider.component.html',
  styleUrl: './unit-slider.component.scss',
})
export class UnitSliderComponent {
  bookingService = inject(ClientBookingService);
  index = signal(0);

  @Input({ required: false }) unitsInput?: Unit[];

  units = computed(
    () => this.unitsInput ?? this.bookingService.filteredUnits()
  );

  current = computed(() => this.units()[this.index()]);

  next() {
    this.index.set((this.index() + 1) % this.units().length);
  }

  prev() {
    this.index.set(
      (this.index() - 1 + this.units().length) % this.units().length
    );
  }

  onBookUnit() {
    console.log('Selected unit:', this.current());
  }
}
