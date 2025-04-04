import { Component, inject } from '@angular/core';
import { NavigatorService } from '../../../services/navigator/navigator.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
})
export class LandingHeaderComponent {
  navigator = inject(NavigatorService);
  constructor() {}
}
