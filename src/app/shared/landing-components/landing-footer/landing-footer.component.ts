import { Component, inject } from '@angular/core';
import { NavigatorService } from '../../../services/navigator/navigator.service';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
})
export class LandingFooterComponent {
  navigator = inject(NavigatorService);
}
