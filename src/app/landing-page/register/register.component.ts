import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  auth = inject(AuthService)

  passVisible = signal(false)

  togglePassVisible() {
    this.passVisible.set(!this.passVisible())
  }
}
