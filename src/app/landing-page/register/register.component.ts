import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast-service/toast.service';
import { FormService } from '../../services/form-service/form.service';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';
import { AriaConverterDirective } from '../../directives/aria-label-converter/aria-converter.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatIcon,
    ReactiveFormsModule,
    ProgressBarComponent,
    AriaConverterDirective,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  formService = inject(FormService);
  navigator = inject(NavigatorService);

  passVisible = signal(false);

  registerForm = inject(FormBuilder).nonNullable.group({
    first_name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(this.formService.namePattern),
      ],
    ],
    last_name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(this.formService.namePattern),
      ],
    ],
    email: [
      '',
      [Validators.required, Validators.pattern(this.formService.emailPattern)],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.formService.passwordPattern),
      ],
    ],
    checkbox: [false, [Validators.requiredTrue]],
  });

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * It's used to reset the register form if the user is already logged in.
   */
  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.registerForm);
      }
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Clears the local and session storage of any existing token and user data.
   * Resets the login data in the AuthService to an empty object.
   */
  ngOnInit() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.auth.loginData.set({});
  }

  /**
   * Toggles the visibility of the password input field.
   */
  togglePassVisible() {
    this.passVisible.set(!this.passVisible());
  }

  /**
   * Submits the registration form data to the authentication service.
   * Sets the register data in the AuthService with the current form values
   * and calls the register method of the AuthService to initiate the registration process.
   */
  register() {
    this.auth.registerData.set(this.registerForm.value);
    this.auth.register();
  }
}
