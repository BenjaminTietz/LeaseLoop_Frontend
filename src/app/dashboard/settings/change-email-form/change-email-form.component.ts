import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { FormService } from '../../../services/form-service/form.service';
import { SettingsService } from '../../../services/settings-service/settings.service';

@Component({
  selector: 'app-change-email-form',
  standalone: true,
  imports: [MatIcon, CommonModule, ReactiveFormsModule, ClickOutsideDirective],
  templateUrl: './change-email-form.component.html',
  styleUrl: './change-email-form.component.scss'
})
export class ChangeEmailFormComponent {
  @Output() close = new EventEmitter()
  formService = inject(FormService)
  settingsService = inject(SettingsService)

  closeForm = () => {
    this.close.emit()
  }

  emailSentResponse = signal('')

  emailForm = new FormBuilder().nonNullable.group({
    actual_email: ['', [Validators.required, Validators.pattern(this.formService.emailPattern), this.matchCurrentEmailValidator(this.settingsService.userEmail())]],
    actual_password: ['', [Validators.required, Validators.pattern(this.formService.passwordPattern)]],
    new_email: ['', [Validators.required, Validators.pattern(this.formService.emailPattern)]],
  })

  get actualEmailErrors(){
    if(this.formService.getFormErrors(this.emailForm, 'actual_email')?.['required']){
      return 'Please enter your actual email'
    }
    if(this.formService.getFormErrors(this.emailForm, 'actual_email')?.['pattern']){
      return 'Please enter a valid email'
    }
    if(this.formService.getFormErrors(this.emailForm, 'actual_email')?.['emailMismatch']){
      return 'Ths is not your email'
    }
    return ''
  }

  get actualPasswordErrors(){
    if(this.formService.getFormErrors(this.emailForm, 'actual_password')?.['required']){
      return 'Please enter your actual password'
    }
    if(this.formService.getFormErrors(this.emailForm, 'actual_password')?.['pattern']){
      return 'Please enter a valid password'
    }
    return ''
  }

  get newEmailErrors(){
    if(this.formService.getFormErrors(this.emailForm, 'new_email')?.['required']){
      return 'Please enter your new email'
    }
    if(this.formService.getFormErrors(this.emailForm, 'new_email')?.['pattern']){
      return 'Please enter a valid email'
    }
    return ''
  }

  changeEmail = () => {
    this.settingsService.changeEmail(this.emailForm.value)
  }

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

  closePopUp() {
    this.formService.resetForm(this.emailForm);
    this.settingsService.errorMessage.set('')
  }

  closeSuccessPopUp() {
    this.settingsService.successful.set(false)
    this.settingsService.sending.set(false)
    this.closePopUp()
    this.close.emit()
  }

}
