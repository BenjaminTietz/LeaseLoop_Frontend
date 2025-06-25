import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';
import { AriaConverterDirective } from '../../directives/aria-label-converter/aria-converter.directive';
import { FormService } from '../../services/form-service/form.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIcon,
    ReactiveFormsModule,
    MatProgressBarModule,
    ProgressBarComponent,
    AriaConverterDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  auth = inject(AuthService);
  navigator = inject(NavigatorService);
  formService = inject(FormService);
  passVisible = signal(false);

  loginForm = new FormBuilder().nonNullable.group({
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
        Validators.maxLength(50),
      ],
    ],
  });

  /**
   * Initializes the LoginComponent and sets up an effect to reset the login form
   * if the authentication is successful.
   */

  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.loginForm);
      }
    });
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component.
   * Checks if a user is already logged in and logged in if there is a token in local or session storage.
   */
  ngOnInit() {
    this.auth.rememberedLogin();
  }

  /**
   * Toggles the visibility of the password input field.
   */
  togglePassVisible() {
    this.passVisible.set(!this.passVisible());
  }

  /**
   * Logs in a user.
   *
   * Sets the login data in the AuthService with the current form values and
   * calls the login method of the AuthService.
   */
  login() {
    this.auth.loginData.set(this.loginForm.value);
    this.auth.login();
  }
}
