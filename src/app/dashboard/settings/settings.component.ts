import { Component, computed, inject, signal } from '@angular/core';
import { ChangePassFormComponent } from "./change-pass-form/change-pass-form.component";
import { ChangeAdressFormComponent } from "./change-adress-form/change-adress-form.component";
import { ChangeEmailFormComponent } from "./change-email-form/change-email-form.component";
import { ChangeImageFormComponent } from "./change-image-form/change-image-form.component";
import { SettingsService } from '../../services/settings-service/settings.service';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../utils/scroll.utils';
import { ClickOutsideDirective } from '../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ChangePassFormComponent, ChangeAdressFormComponent, ChangeEmailFormComponent, ChangeImageFormComponent, ClickOutsideDirective, MatIcon],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  changePass = signal(false)
  changeEmail = signal(false)
  changeImage = signal(false)
  changePersonals = signal(false)
  showFoto = signal(false)



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
    address : {
      street: '123 Main St',
      city: 'Anytown',
      street_number: '123',
      country: 'USA',
      zip: '12345'
    },
    tax_id : '123456789'
  }

  constructor() {
    this.settingsService.getLogo()
    
  }

 

  openForm = (form: 'changePass' | 'changeEmail' | 'changePersonals' | 'changeImage' | 'showFoto')  => {
    this[form].set(true);
    this.settingsService.successful.set(false);
    disableBackgroundScroll();
  }
  

  closeAllForms = () => {
    this.settingsService.successful.set(false);
    this.changePass.set(false);
    this.changeEmail.set(false);
    this.changeImage.set(false);
    this.changePersonals.set(false);
    this.showFoto.set(false);
    enableBackgroundScroll();
  }
}
