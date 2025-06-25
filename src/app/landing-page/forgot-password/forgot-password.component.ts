import { Component, effect, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { FormService } from '../../services/form-service/form.service';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [MatIcon, ReactiveFormsModule, ProgressBarComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  navigator = inject(NavigatorService);
  auth = inject(AuthService);
  formService = inject(FormService);

  /**
   * Constructor for ForgotPasswordComponent.
   * It checks if the user is logged in or not.
   * If the user is logged in, it resets the form.
   */
  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.forgotForm);
      }
    });
  }

  forgotForm = new FormBuilder().nonNullable.group({
    email: [
      '',
      [Validators.required, Validators.pattern(this.formService.emailPattern)],
    ],
  });

  /**
   * Handles the forgot password form submission.
   * It gets the email from the form and submits it to the auth service to send a reset password email.
   * The form is reset if the user is logged in.
   */
  forgotPassword() {
    this.auth.forgotEmail.set(this.forgotForm.value.email!);
    this.auth.sendResetPasswordEmail();
  }
}
