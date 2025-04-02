import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeButtonComponent } from './shared/global/theme-button/theme-button.component';
import { ToastComponent } from './shared/toast/toast.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeButtonComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'HostPilot';
}
