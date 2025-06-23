import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { SettingsService } from '../../../services/settings-service/settings.service';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { FormService } from '../../../services/form-service/form.service';

@Component({
  selector: 'app-change-pass-form',
  standalone: true,
  imports: [MatIcon, CommonModule, ClickOutsideDirective, ReactiveFormsModule],
  templateUrl: './change-pass-form.component.html',
  styleUrl: './change-pass-form.component.scss',
})
export class ChangePassFormComponent {
  @Output() close = new EventEmitter();
  formService = inject(FormService);
  settingsService = inject(SettingsService);

  changePassForm = new FormBuilder().nonNullable.group(
    {
      old_password: [
        '',
        [
          Validators.required,
          Validators.pattern(this.formService.passwordPattern),
        ],
      ],
      new_password: [
        '',
        [
          Validators.required,
          Validators.pattern(this.formService.passwordPattern),
        ],
      ],
      confirm_password: [
        '',
        [
          Validators.required,
          Validators.pattern(this.formService.passwordPattern),
        ],
      ],
    },
    { validators: this.passwordMatchValidator() }
  );

  /**
   * A validator function that will be used to validate the form group. It
   * checks if the new_password and confirm_password values are the same.
   * If they are not, it returns a ValidationErrors object with a single
   * property, passwordMismatch, set to true.
   */
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('new_password')?.value;
      const repeatedPassword = control.get('confirm_password')?.value;
      return password === repeatedPassword ? null : { passwordMismatch: true };
    };
  }

  /**
   * Call the settings service to change the user's password with the new value in
   * the form.
   */
  changePassword() {
    this.settingsService.changePassword(this.changePassForm.value);
  }

  closeForm = () => {
    this.close.emit();
  };

  /**
   * Returns an error message related to the 'confirm_password' field in the change password form.
   * Checks if the passwords do not match, if the password is required, or if it doesn't match the required pattern.
   * Returns a specific error message for each case, or an empty string if there are no errors.
   */
  get repeatPasswordErrors() {
    const groupErrors = this.changePassForm.errors;
    const confirmCtrlErrors = this.formService.getFormErrors(
      this.changePassForm,
      'confirm_password'
    );
    if (groupErrors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    if (confirmCtrlErrors?.['required']) {
      return 'Password is required';
    }
    if (confirmCtrlErrors?.['pattern']) {
      return 'Password must include upper/lowercase, a number and a special character';
    }
    return '';
  }

  /**
   * Returns an error message related to the 'new_password' field in the change password form.
   * Checks if the password is required, or if it doesn't match the required pattern.
   * Returns a specific error message for each case, or an empty string if there are no errors.
   */
  get newPasswordErrors() {
    const newCtrlErrors = this.formService.getFormErrors(
      this.changePassForm,
      'new_password'
    );
    if (newCtrlErrors?.['required']) {
      return 'Password is required';
    }
    if (newCtrlErrors?.['pattern']) {
      return 'Password must include upper/lowercase, a number and a special character';
    }
    return '';
  }

  /**
   * Returns an error message related to the 'old_password' field in the change password form.
   * Checks if the password is required or if it doesn't match the required pattern.
   * Returns a specific error message for each case, or an empty string if there are no errors.
   */
  get oldPasswordErrors() {
    const oldCtrlErrors = this.formService.getFormErrors(
      this.changePassForm,
      'old_password'
    );
    if (oldCtrlErrors?.['required']) {
      return 'Password is required';
    }
    if (oldCtrlErrors?.['pattern']) {
      return 'Password must include upper/lowercase, a number and a special character';
    }
    return '';
  }

  /**
   * Resets the form and clears the error message.
   * Called when the error popup is closed.
   */
  closePopUp() {
    this.formService.resetForm(this.changePassForm);
    this.settingsService.errorMessage.set('');
  }

  /**
   * Closes the success popup after changing the user's password.
   * Resets the 'successful' flag of the settings service to false.
   * Resets the form and clears the error message of the settings service.
   * Emits a close event to the parent component.
   */
  closeSuccessPopUp() {
    this.settingsService.successful.set(false);
    this.closePopUp();
    this.close.emit();
  }
}
