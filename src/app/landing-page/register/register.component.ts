import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast-service/toast.service';
import { FormService } from '../../services/form-service/form.service';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { AriaConverterDirective } from '../../directives/aria-label-converter/aria-converter.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatIcon, ReactiveFormsModule, ProgressBarComponent, AriaConverterDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  auth = inject(AuthService);
  toast = inject(ToastService);
  formService = inject(FormService)
  navigator = inject(NavigatorService)

  passVisible = signal(false);

  registerForm = inject(FormBuilder).nonNullable.group({
    first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.formService.namePattern)]],
    last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.formService.namePattern)]],
    email: ['', [Validators.required, Validators.pattern(this.formService.emailPattern)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern( this.formService.passwordPattern),
      ],
    ],
    checkbox : [false, [Validators.requiredTrue]]
  });

  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.registerForm);
      }
    });
  }

  togglePassVisible() {
    this.passVisible.set(!this.passVisible());
  }

  register() {
    this.auth.registerData.set(this.registerForm.value);
    this.auth.register();
  }

  ngOnInit(){
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.auth.loginData.set({});
  }
}
