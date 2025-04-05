import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { AriaConverterDirective } from '../../directives/aria-label-converter/aria-converter.directive';
import { FormService } from '../../services/form-service/form.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIcon, ReactiveFormsModule, MatProgressBarModule, ProgressBarComponent, AriaConverterDirective ],
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
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'),
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
  });

  constructor() {
    effect(() => {
      if (this.auth.successful()) {
        this.formService.resetForm(this.loginForm);
      }
    });
    
  }

  ngOnInit(){
    this.auth.rememberedLogin();
  }

  togglePassVisible() {
    this.passVisible.set(!this.passVisible());
  }

  login() {
    this.auth.loginData.set(this.loginForm.value);
    this.auth.login()
  }
}
