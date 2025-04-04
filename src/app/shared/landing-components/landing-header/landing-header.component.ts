import { Component, inject } from '@angular/core';
import { NavigatorService } from '../../../services/navigator/navigator.service';
import { MatIcon } from '@angular/material/icon';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-landing-header',
  standalone: true,
  imports: [MatIcon, LogoComponent],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
})
export class LandingHeaderComponent {
  navigator = inject(NavigatorService);
  constructor() {}
}
