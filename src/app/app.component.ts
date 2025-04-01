import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeButtonComponent } from './shared/global/theme-button/theme-button.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'HostPilot';
}
