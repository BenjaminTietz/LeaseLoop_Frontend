import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { FormService } from '../../services/form-service/form.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MatIcon, ProgressBarComponent, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  navigator = inject(NavigatorService);
  auth = inject(AuthService)
  formService = inject(FormService);
  passVisible = signal(false);
  repeatPassVisible = signal(false);
  route = inject(ActivatedRoute)

  resetForm = new FormBuilder().nonNullable.group({
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/
        ),
      ],
    ],
    repeated_password: ['', Validators.required]
  },
    { validators: this.passwordMatchValidator() }
  );

  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.resetForm);
      }
    });
  }

  ngOnInit(): void {
   let token = this.route.snapshot.paramMap.get('token')!;
   this.auth.resetToken.set(token);
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const repeatedPassword = control.get('repeated_password')?.value;
      return password === repeatedPassword ? null : { passwordMismatch: true };
    };
  }

  togglePassVisible(pass: string) {
    if (pass === 'pass') {
      this.passVisible.set(!this.passVisible());
    } else {
      this.repeatPassVisible.set(!this.repeatPassVisible());
    }
  }

  resetPassword(){
    this.auth.resetData.set(this.resetForm.value);
    this.auth.resetPassword();
  }
}
