import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, inject, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { SettingsService } from '../../../services/settings-service/settings.service';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { FormService } from '../../../services/form-service/form.service';

@Component({
  selector: 'app-change-pass-form',
  standalone: true,
  imports: [MatIcon, CommonModule, ClickOutsideDirective, ReactiveFormsModule],
  templateUrl: './change-pass-form.component.html',
  styleUrl: './change-pass-form.component.scss'
})
export class ChangePassFormComponent {
  @Output() close = new EventEmitter()
  formService = inject(FormService)
  settingsService = inject(SettingsService)

  changePassForm = new FormBuilder().nonNullable.group({
    old_password: ['', [Validators.required, Validators.pattern(this.formService.passwordPattern)]],
    new_password: ['', [Validators.required, Validators.pattern(this.formService.passwordPattern)]],
    confirm_password: ['', [Validators.required, Validators.pattern(this.formService.passwordPattern)]],
  }, { validators: this.passwordMatchValidator()} )

  constructor() {}

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('new_password')?.value;
      const repeatedPassword = control.get('confirm_password')?.value;
      return password === repeatedPassword ? null : { passwordMismatch: true };
    };
  }

  changePassword() {
    this.settingsService.changePassword(this.changePassForm.value)
  }

  closeForm = () => {
    this.close.emit()
  }

  get repeatPasswordErrors() {
    const groupErrors = this.changePassForm.errors;
    const confirmCtrlErrors = this.formService.getFormErrors(this.changePassForm, 'confirm_password');
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

  get newPasswordErrors() {
    const newCtrlErrors = this.formService.getFormErrors(this.changePassForm, 'new_password');
    if (newCtrlErrors?.['required']) {
      return 'Password is required';
    }
    if (newCtrlErrors?.['pattern']) {
      return 'Password must include upper/lowercase, a number and a special character';
    }
    return '';
  }

  get oldPasswordErrors() {
    const oldCtrlErrors = this.formService.getFormErrors(this.changePassForm, 'old_password');
    if (oldCtrlErrors?.['required']) {
      return 'Password is required';
    }
    if (oldCtrlErrors?.['pattern']) {
      return 'Password must include upper/lowercase, a number and a special character';
    }
    return '';
  }

  closePopUp() {
    this.formService.resetForm(this.changePassForm);
    this.settingsService.errorMessage.set('')
  }

  closeSuccessPopUp() {
    this.settingsService.successful.set(false)
    this.closePopUp()
    this.close.emit()
  }

}
