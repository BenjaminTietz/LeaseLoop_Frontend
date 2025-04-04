import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast-service/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatIcon, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);

  passVisible = signal(false);

  registerForm = inject(FormBuilder).nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
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
  });

  togglePassVisible() {
    this.passVisible.set(!this.passVisible());
  }

  register() {
    this.auth.registerData.set(this.registerForm.value);
    this.auth.register();
  }

  get emailErrors() {
    const control = this.registerForm.controls.email;
    return control.touched && control.invalid ? control.errors : null;
  }

  get passwordErrors() {
    const control = this.registerForm.controls.password;
    return control.touched && control.invalid ? control.errors : null;
  }

}
