import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { FormService } from '../../../services/form-service/form.service';
import { SettingsService } from '../../../services/settings-service/settings.service';

@Component({
  selector: 'app-change-email-form',
  standalone: true,
  imports: [MatIcon, CommonModule, ReactiveFormsModule, ClickOutsideDirective],
  templateUrl: './change-email-form.component.html',
  styleUrl: './change-email-form.component.scss',
})
export class ChangeEmailFormComponent {
  @Output() close = new EventEmitter();
  formService = inject(FormService);
  settingsService = inject(SettingsService);

  closeForm = () => {
    this.close.emit();
  };

  emailSentResponse = signal('');

  emailForm = new FormBuilder().nonNullable.group({
    actual_email: [
      '',
      [
        Validators.required,
        Validators.pattern(this.formService.emailPattern),
        this.matchCurrentEmailValidator(this.settingsService.userEmail()),
      ],
    ],
    actual_password: [
      '',
      [
        Validators.required,
        Validators.pattern(this.formService.passwordPattern),
      ],
    ],
    new_email: [
      '',
      [Validators.required, Validators.pattern(this.formService.emailPattern)],
    ],
  });

  /**
   * Returns an error message related to the 'actual_email' field in the email form.
   * Checks if the email is required, if it matches the valid email pattern, and if it matches the current user's email.
   * Returns a specific error message for each case, or an empty string if there are no errors.
   */
  get actualEmailErrors() {
    if (
      this.formService.getFormErrors(this.emailForm, 'actual_email')?.[
        'required'
      ]
    ) {
      return 'Please enter your actual email';
    }
    if (
      this.formService.getFormErrors(this.emailForm, 'actual_email')?.[
        'pattern'
      ]
    ) {
      return 'Please enter a valid email';
    }
    if (
      this.formService.getFormErrors(this.emailForm, 'actual_email')?.[
        'emailMismatch'
      ]
    ) {
      return 'Ths is not your email';
    }
    return '';
  }

  /**
   * Returns an error message related to the 'actual_password' field in the email form.
   * Checks if the password is required and if it matches the valid password pattern.
   * Returns a specific error message for each case, or an empty string if there are no errors.
   */
  get actualPasswordErrors() {
    if (
      this.formService.getFormErrors(this.emailForm, 'actual_password')?.[
        'required'
      ]
    ) {
      return 'Please enter your actual password';
    }
    if (
      this.formService.getFormErrors(this.emailForm, 'actual_password')?.[
        'pattern'
      ]
    ) {
      return 'Please enter a valid password';
    }
    return '';
  }

  /**
   * Returns an error message related to the 'new_email' field in the email form.
   * Checks if the new email is required and if it matches the valid email pattern.
   * Returns a specific error message for each case, or an empty string if there are no errors.
   */
  get newEmailErrors() {
    if (
      this.formService.getFormErrors(this.emailForm, 'new_email')?.['required']
    ) {
      return 'Please enter your new email';
    }
    if (
      this.formService.getFormErrors(this.emailForm, 'new_email')?.['pattern']
    ) {
      return 'Please enter a valid email';
    }
    return '';
  }

  changeEmail = () => {
    this.settingsService.changeEmail(this.emailForm.value);
  };

  /**
   * A validator function that takes an email as an argument and checks if
   * the value of the AbstractControl passed to it matches the given email.
   * If the values do not match, it returns an object with an 'emailMismatch'
   * property. Otherwise, it returns null.
   * @param currentEmail the email to compare the value of the AbstractControl to.
   * @returns A ValidatorFn that returns a ValidationErrors object if the values do not match,
   * or null if they do.
   */
  matchCurrentEmailValidator(currentEmail: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputEmail = control.value?.trim().toLowerCase();
      const expectedEmail = currentEmail?.trim().toLowerCase();
      if (inputEmail && expectedEmail && inputEmail !== expectedEmail) {
        return { emailMismatch: true };
      }
      return null;
    };
  }

  /**
   * Resets the email form and clears the error message of the settings service when the popup is closed.
   */
  closePopUp() {
    this.formService.resetForm(this.emailForm);
    this.settingsService.errorMessage.set('');
  }

  /**
   * Closes the success popup after changing the user's email.
   * Resets the 'successful' and 'sending' flags of the settings service to false.
   * Resets the email form and clears the error message of the settings service.
   * Emits a close event to the parent component.
   */
  closeSuccessPopUp() {
    this.settingsService.successful.set(false);
    this.settingsService.sending.set(false);
    this.closePopUp();
    this.close.emit();
  }
}
