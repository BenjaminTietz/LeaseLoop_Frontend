import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../directives/outside-click/click-outside.directive';

@Component({
  selector: 'app-client-booking-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,
  MatIcon, ClickOutsideDirective],
  templateUrl: './client-booking-form.component.html',
  styleUrl: './client-booking-form.component.scss'
})
export class ClientBookingFormComponent {
  @Output() close = new EventEmitter()

  clientBookingForm = new FormBuilder().nonNullable.group({})

  closeForm = () => this.close.emit()
}
