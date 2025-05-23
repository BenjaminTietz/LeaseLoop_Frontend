import { Component, computed, Input, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Unit } from '../../models/unit.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-popup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './booking-popup.component.html',
  styleUrl: './booking-popup.component.scss',
})
export class BookingPopupComponent {
  @Input({ required: true }) unit!: Unit;
  @Input({ required: true }) closePopup!: () => void;

  checkIn = signal<string>('');
  checkOut = signal<string>('');
  guests = signal<number>(1);

  //TODO: need to make sure that unit is available for the selected dates
  today = new Date().toISOString().split('T')[0];

  isValid = computed(() => {
    const checkIn = new Date(this.checkIn());
    const checkOut = new Date(this.checkOut());
    const today = new Date(new Date().toDateString());

    return (
      !!this.checkIn() &&
      !!this.checkOut() &&
      checkIn >= today &&
      checkOut > checkIn &&
      this.guests() >= 1 &&
      this.guests() <= this.unit.max_capacity
    );
  });

  totalPrice = computed(() => {
    const inDate = new Date(this.checkIn());
    const outDate = new Date(this.checkOut());
    const guests = this.guests();
    const nights = Math.max((+outDate - +inDate) / (1000 * 60 * 60 * 24), 0);

    if (nights === 0) return 0;
    const base = this.unit.price_per_night * nights;
    const extras =
      Math.max(0, guests - this.unit.capacity) *
      this.unit.price_per_extra_person *
      nights;
    return base + extras;
  });

  handleCheckInChange(date: string) {
    this.checkIn.set(date);

    const checkInDate = new Date(date);
    const checkOutDate = new Date(this.checkOut());

    if (!this.checkOut() || checkOutDate <= checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      this.checkOut.set(nextDayStr);
    }
  }

  submitBooking() {
    if (!this.isValid()) return;
    console.log('Submitting booking:', {
      checkIn: this.checkIn(),
      checkOut: this.checkOut(),
      guests: this.guests(),
      total: this.totalPrice(),
    });
  }
}
