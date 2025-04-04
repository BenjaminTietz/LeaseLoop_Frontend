import { Component, inject } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-main-landing',
  standalone: true,
  imports: [],
  templateUrl: './main-landing.component.html',
  styleUrl: './main-landing.component.scss',
})
export class MainLandingComponent {
  navigator = inject(NavigatorService);
}
