import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';
import { FormService } from '../../services/form-service/form.service';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AriaConverterDirective } from '../../directives/aria-label-converter/aria-converter.directive';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    MatIcon,
    ProgressBarComponent,
    ReactiveFormsModule,
    AriaConverterDirective,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  navigator = inject(NavigatorService);
  auth = inject(AuthService);
  formService = inject(FormService);
  passVisible = signal(false);
  repeatPassVisible = signal(false);
  route = inject(ActivatedRoute);

  resetForm = new FormBuilder().nonNullable.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(this.formService.passwordPattern),
        ],
      ],
      repeated_password: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator() }
  );

  /**
   * Initializes the component with an effect to reset the form
   * when the authentication is successful. This method sets up
   * the necessary reactive logic to observe changes in the
   * authentication state and reset the resetForm accordingly.
   */
  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.resetForm);
      }
    });
  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component.
   * Retrieves the token from the route parameter map and sets the resetToken signal
   * in the AuthService with the retrieved value. This is necessary because the form
   * is reused for both creating and editing units.
   */
  ngOnInit(): void {
    let token = this.route.snapshot.paramMap.get('token')!;
    this.auth.resetToken.set(token);
  }

  /**
   * Custom validator that checks if the password and repeated password values
   * in the form are equal. If they are equal, the validator returns null, otherwise
   * it returns an object with a single property, 'passwordMismatch' set to true. This
   * validator is used to validate the reset password form in the ResetPasswordComponent.
   */
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const repeatedPassword = control.get('repeated_password')?.value;
      return password === repeatedPassword ? null : { passwordMismatch: true };
    };
  }

  /**
   * Toggles the visibility of the password and repeated password fields in the
   * reset password form. The visibility is controlled by the passVisible and
   * repeatPassVisible signals in the AuthService. This method is used to toggle
   * the visibility of the password fields when the user clicks on the
   * visibility icon in the password fields. The method takes a parameter 'pass'
   * which is either 'pass' or 'repeat'. If the parameter is 'pass', the
   * passVisible signal is toggled, otherwise the repeatPassVisible signal is
   * toggled.
   * @param pass the type of password field to toggle, either 'pass' or 'repeat'
   */
  togglePassVisible(pass: string) {
    if (pass === 'pass') {
      this.passVisible.set(!this.passVisible());
    } else {
      this.repeatPassVisible.set(!this.repeatPassVisible());
    }
  }

  /**
   * Submits the reset password form data to the AuthService.
   * The form data is set in the AuthService's resetData before
   * calling the resetPassword method of the AuthService.
   * This method is typically triggered when the user submits
   * the reset password form.
   */
  resetPassword() {
    this.auth.resetData.set(this.resetForm.value);
    this.auth.resetPassword();
  }
}
