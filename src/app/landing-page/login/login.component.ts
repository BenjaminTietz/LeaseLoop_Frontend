import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIcon, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  auth = inject(AuthService);
  navigator = inject(NavigatorService);
  passVisible = signal(false);

  loginForm = new FormBuilder().nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/
        ),
        Validators.maxLength(50),
      ],
    ],
    remember: [false],
  });

  togglePassVisible() {
    this.passVisible.set(!this.passVisible());
  }

  login() {
    const credentials = {
      username: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };
    const remember = this.loginForm.value.remember!;
    this.auth.loginUser(credentials, remember);
  }

  get passwordErrors() {
    const control = this.loginForm.controls.password;
    return control.touched && control.invalid ? control.errors : null;
  }

  get emailErrors() {
    const control = this.loginForm.controls.email;
    return control.touched && control.invalid ? control.errors : null;
  }

  markAllAsTouched() {
    this.loginForm.markAllAsTouched();
  }

  unmarkAllAsTouched() {
    Object.values(this.loginForm.controls).forEach((control) => {
      control.markAsUntouched();
    });
  }
}
