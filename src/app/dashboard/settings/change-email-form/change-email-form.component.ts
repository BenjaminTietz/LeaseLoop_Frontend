import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';

@Component({
  selector: 'app-change-email-form',
  standalone: true,
  imports: [MatIcon, CommonModule, ReactiveFormsModule, ClickOutsideDirective],
  templateUrl: './change-email-form.component.html',
  styleUrl: './change-email-form.component.scss'
})
export class ChangeEmailFormComponent {
  @Output() close = new EventEmitter()

  closeForm = () => {
    this.close.emit()
  }

  emailSentResponse = signal('')

  emailForm = new FormBuilder().nonNullable.group({
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$')]],
  })

}
