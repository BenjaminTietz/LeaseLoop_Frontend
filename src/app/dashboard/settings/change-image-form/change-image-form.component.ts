import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { SettingsService } from '../../../services/settings-service/settings.service';

@Component({
  selector: 'app-change-image-form',
  standalone: true,
  imports: [MatIcon, ClickOutsideDirective],
  templateUrl: './change-image-form.component.html',
  styleUrl: './change-image-form.component.scss',
})
export class ChangeImageFormComponent {
  @Output() close = new EventEmitter();
  settingsService = inject(SettingsService);
  imagePreview = signal('');
  imageFile = signal<File>(new File([], ''));
  image = computed(
    () =>
      this.imagePreview() || this.settingsService.logoPath() || 'favicon.ico'
  );

  /**
   * This constructor calls the service to get the current logo and sets up an effect to listen
   * for a successful response. When the response is successful, it will call the closeForm method
   * to close the form.
   * @note This is a one-time effect that will only be triggered once when the component is created.
   */
  constructor() {
    this.settingsService.getLogo();
    effect(
      () => {
        if (this.settingsService.successful()) this.closeForm();
      },
      { allowSignalWrites: true }
    );
  }

  onImageChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
    this.imageFile.set(file);
  };

  /**
   * Changes the user's image if a new image preview is available.
   *
   * This method checks if there is an image preview available, and if so,
   * it triggers the changeImage function of the settings service with the
   * current image file.
   */
  changeImage() {
    if (this.imagePreview() != '') {
      this.settingsService.changeImage(this.imageFile());
    }
  }

  closeForm = () => {
    this.close.emit();
    this.settingsService.successful.set(false);
  };
}
