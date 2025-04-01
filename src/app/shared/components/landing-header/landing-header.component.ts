import { Component, inject} from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss'
})
export class LandingHeaderComponent {
  navigator = inject(NavigatorService)
  constructor() {}
}
