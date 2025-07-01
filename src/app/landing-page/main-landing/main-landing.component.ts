import { Component, inject, signal } from '@angular/core';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { AuthService } from '../../services/auth/auth.service';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { InfoOverlayComponent } from "../../shared/global/info-overlay/info-overlay.component";
import { disableBackgroundScroll, enableBackgroundScroll } from '../../utils/scroll.utils';

@Component({
  selector: 'app-main-landing',
  standalone: true,
  imports: [ProgressBarComponent, InfoOverlayComponent],
  templateUrl: './main-landing.component.html',
  styleUrl: './main-landing.component.scss',
})
export class MainLandingComponent {
  navigator = inject(NavigatorService);
  auth = inject(AuthService);
  infoOverlay = signal(true)

  closeInfo() {
    this.infoOverlay.set(false)
    enableBackgroundScroll();
    sessionStorage.setItem('infoShownOwner', 'true');
  }
  ngOnInit() {
    if (sessionStorage.getItem('infoShownOwner') === 'true') {
      this.infoOverlay.set(false);
    } else {
      this.infoOverlay.set(true);
      disableBackgroundScroll();
    }
  }

}
