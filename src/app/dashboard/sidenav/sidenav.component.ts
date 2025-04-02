import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, ThemeButtonComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  navigator = inject(NavigatorService);
  auth = inject(AuthService);
}
