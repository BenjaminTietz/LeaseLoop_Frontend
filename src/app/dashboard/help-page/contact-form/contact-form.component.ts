import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIcon, ClickOutsideDirective],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
  @Output() close = new EventEmitter()
  router = inject(Router)
  
  closeForm = () => {
    this.close.emit()
  }

  contactForm = new FormBuilder().nonNullable.group({
    first_name: [''],
    last_name: [''],
    email: [''],
    message: ['']
  })
}
