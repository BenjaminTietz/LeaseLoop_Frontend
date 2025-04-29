import { Component, computed, inject, signal } from '@angular/core';
import { ChangePassFormComponent } from "./change-pass-form/change-pass-form.component";
import { ChangeAdressFormComponent } from "./change-adress-form/change-adress-form.component";
import { ChangeEmailFormComponent } from "./change-email-form/change-email-form.component";
import { ChangeImageFormComponent } from "./change-image-form/change-image-form.component";
import { SettingsService } from '../../services/settings-service/settings.service';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../utils/scroll.utils';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ChangePassFormComponent, ChangeAdressFormComponent, ChangeEmailFormComponent, ChangeImageFormComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  changePass = signal(false)
  changeEmail = signal(false)
  changeAddress = signal(false)
  changeImage = signal(false)

  settingsService = inject(SettingsService)

  image = computed(() => {
    if(this.settingsService.userLogo() === ''){
      return 'favicon.ico'
    }else{
      return this.settingsService.logoPath()
    }
  });
  user = {
    name: 'John Doe',
    email: 'KjY4l@example.com',
    adress : '123 Main St, Anytown, USA',
  }

  constructor() {
    this.settingsService.getLogo()
    
  }

  openChangePass() {
    this.changePass.set(true)
    disableBackgroundScroll()
  }

  openChangeEmail() {
    this.changeEmail.set(true)
    disableBackgroundScroll()
  }

  openChangeAddress() {
    this.changeAddress.set(true)
    disableBackgroundScroll()
  }

  openChangeImage() {
    this.changeImage.set(true)
    disableBackgroundScroll()
  }



  closeForm() {
    this.changePass.set(false)
    this.changeEmail.set(false)
    this.changeAddress.set(false)
    this.changeImage.set(false)
    enableBackgroundScroll()
  }
}
