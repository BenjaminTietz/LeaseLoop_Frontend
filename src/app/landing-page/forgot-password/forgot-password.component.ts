import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NavigatorService } from '../../shared/services/navigator/navigator.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  navigator = inject(NavigatorService);
}
