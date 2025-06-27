import { Component, computed, inject, signal } from '@angular/core';
import { ChangePassFormComponent } from './change-pass-form/change-pass-form.component';
import { ChangeAdressFormComponent } from './change-adress-form/change-adress-form.component';
import { ChangeEmailFormComponent } from './change-email-form/change-email-form.component';
import { ChangeImageFormComponent } from './change-image-form/change-image-form.component';
import { SettingsService } from '../../services/settings-service/settings.service';
import {
  disableBackgroundScroll,
  enableBackgroundScroll,
} from '../../utils/scroll.utils';
import { ClickOutsideDirective } from '../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { environment } from '../../../environments/environment';
import { getMediaUrl } from '../../utils/media-path.utils';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ChangePassFormComponent,
    ChangeAdressFormComponent,
    ChangeEmailFormComponent,
    ChangeImageFormComponent,
    ClickOutsideDirective,
    MatIcon,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  changePass = signal(false);
  changeEmail = signal(false);
  changeImage = signal(false);
  changePersonals = signal(false);
  showFoto = signal(false);
  settingsService = inject(SettingsService);

  image = computed(() => {
    if (
      this.showData() == false ||
      this.settingsService.newUserData().image.logo == null
    ) {
      return 'favicon.ico';
    } else {
      return (
        getMediaUrl(this.settingsService.newUserData().image.logo)
      );
    }
  });

  showData = computed(() => {
    const data = this.settingsService.newUserData();
    return !!data && typeof data === 'object' && Object.keys(data).length > 0;
  });

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Lifecycle hook that is called after the component has been initialized.
   * Calls SettingsService.getUserFullData() to fetch the user's data.
   */
  constructor() {
    this.settingsService.getUserFullData();
  }

  openForm = (
    form:
      | 'changePass'
      | 'changeEmail'
      | 'changePersonals'
      | 'changeImage'
      | 'showFoto'
  ) => {
    this[form].set(true);
    this.settingsService.successful.set(false);
    disableBackgroundScroll();
  };

  closeAllForms = () => {
    this.settingsService.successful.set(false);
    this.settingsService.sending.set(false);
    this.changePass.set(false);
    this.changeEmail.set(false);
    this.changeImage.set(false);
    this.changePersonals.set(false);
    this.showFoto.set(false);
    enableBackgroundScroll();
    this.settingsService.getUserFullData();
  };
}
