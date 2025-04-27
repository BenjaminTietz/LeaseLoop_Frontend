import { Component, inject } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";

@Component({
  selector: 'app-main-landing',
  standalone: true,
  imports: [ProgressBarComponent],
  templateUrl: './main-landing.component.html',
  styleUrl: './main-landing.component.scss',
})
export class MainLandingComponent {
  navigator = inject(NavigatorService);
  auth = inject(AuthService);
}
