import { Component, inject } from '@angular/core';
import { SettingsService } from '../../services/settings-service/settings.service';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-fill-data-overlay',
  standalone: true,
  imports: [],
  templateUrl: './fill-data-overlay.component.html',
  styleUrl: './fill-data-overlay.component.scss',
})
export class FillDataOverlayComponent {
  settingsService = inject(SettingsService);
  navigator = inject(NavigatorService);

  /**
   * Initializes the FillDataOverlayComponent by retrieving the full user data
   * from the settings service.
   */

  constructor() {
    this.settingsService.getUserFullData();
  }
}
