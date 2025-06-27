import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { FormService } from '../../../services/form-service/form.service';
import { environment } from '../../../../environments/environment';
import { HttpService } from '../../../services/httpclient/http.service';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon,
    ClickOutsideDirective,
    ProgressBarComponent,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  @Output() close = new EventEmitter();
  formService = inject(FormService);
  httpClient = inject(HttpService);
  sending = signal(false);

  themes = signal([
    'dashboard',
    'properties',
    'bookings',
    'clients',
    'settings',
    'units',
    'services',
    'promocodes',
    'invoices',
    'analytics',
    'technical',
  ]);

  closeForm = () => {
    this.sending.set(false);
    this.close.emit();
  };

  contactForm = new FormBuilder().nonNullable.group({
    message: ['', [Validators.required, Validators.minLength(20)]],
    theme: ['', [Validators.required]],
  });

  ngOnInit(){
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  sendMessage = () => {
    this.sending.set(true);
    this.httpClient
      .post(environment.apiBaseUrl + '/api/contact/', this.contactForm.value)
      .subscribe({
        next: () => {
          this.closeForm();
          this.sending.set(false);
        },
        error: () => {
          console.error('Failed to send message');
          this.sending.set(false);
        },
      });
  };

  /**
   * Checks for errors related to the 'theme' selection in the contact form.
   * Returns an error message if the 'theme' field is required and not selected, otherwise returns an empty string.
   */

  getSelectErrors() {
    if (
      this.formService.getFormErrors(this.contactForm, 'theme')?.['required']
    ) {
      return 'Please select a theme';
    }
    return '';
  }

  /**
   * Checks for errors related to the 'message' field in the contact form.
   * Returns an error message if the 'message' field is required and not entered, or if the message is not long enough,
   * otherwise returns an empty string.
   */
  getMessageErrors() {
    if (
      this.formService.getFormErrors(this.contactForm, 'message')?.['required']
    ) {
      return 'Please enter a message';
    }
    if (
      this.formService.getFormErrors(this.contactForm, 'message')?.['minlength']
    ) {
      return 'Message must be at least 20 characters long';
    }
    return '';
  }
}
