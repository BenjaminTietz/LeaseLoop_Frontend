import { Component, effect, EventEmitter, inject, Output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { SettingsService } from '../../../services/settings-service/settings.service';

@Component({
  selector: 'app-change-image-form',
  standalone: true,
  imports: [MatIcon, ClickOutsideDirective],
  templateUrl: './change-image-form.component.html',
  styleUrl: './change-image-form.component.scss'
})
export class ChangeImageFormComponent {
  @Output () close = new EventEmitter()
  settingsService = inject(SettingsService)
  imagePreview = signal('')
  imageFile = signal<File>(new File([], ''))

  constructor() {
    this.settingsService.getLogo()
    effect(() => {
      if(this.settingsService.successful()) this.closeForm()
    } , { allowSignalWrites: true })
  }

  onImageChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    }
    reader.readAsDataURL(file);
    this.imageFile.set(file)
  }

  changeImage(){
    if(this.imagePreview() != ''){
      this.settingsService.changeImage(this.imageFile())
    }
  }
 


  closeForm = () => {
    this.close.emit()
    this.settingsService.successful.set(false)
  }
}
