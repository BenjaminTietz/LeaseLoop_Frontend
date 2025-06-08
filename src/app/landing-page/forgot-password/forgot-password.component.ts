import { Component, effect, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { FormService } from '../../services/form-service/form.service';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";

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
  formService = inject(FormService)

  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.forgotForm);
      }
    });
  }

  forgotForm = new FormBuilder().nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(this.formService.emailPattern)]],
  });

  forgotPassword() {
    this.auth.forgotEmail.set(this.forgotForm.value.email!);
    this.auth.sendResetPasswordEmail();
  }
}
