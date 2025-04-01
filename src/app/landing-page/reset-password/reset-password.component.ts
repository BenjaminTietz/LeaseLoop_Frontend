import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../shared/services/navigator/navigator.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  navigator = inject(NavigatorService)
  passVisible = signal(false)
  repeatPassVisible = signal(false)

  togglePassVisible(pass : string) {
    if (pass === 'pass') {
      this.passVisible.set(!this.passVisible())
    } else {
      this.repeatPassVisible.set(!this.repeatPassVisible())
    }
  }
}
