import {
  Component,
  computed,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { MatIcon } from '@angular/material/icon';
import { UnitsService } from '../../../services/units-service/units.service';
import { getMediaUrl } from '../../../utils/media-path.utils';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  imagePreviews: string[] = [];
  @Output() imagesChange = new EventEmitter<any[]>();
  @Output() newImageDescriptionsChange = new EventEmitter<string[]>();
  @Output() missingDescriptionChange = new EventEmitter<boolean>();
  propertyService = inject(PropertiesService);
  unitService = inject(UnitsService);
  existingImageBase64s: string[] = [];
  images: File[] = [];
  newImageDescriptions: string[] = [];
  missingDescription: boolean = false;
  imageTooBig = signal('');
  maxImagesReached = signal(false);
  isCreateMode = computed(
    () =>
      !this.propertyService.selectedProperty() &&
      !this.unitService.selectedUnit()
  );
  hasExistingImages = computed(
    () =>
      (this.propertyService.selectedProperty()?.images?.length || 0) > 0 ||
      (this.unitService.selectedUnit()?.images?.length || 0) > 0
  );

  getMediaUrl = getMediaUrl;

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component.
   * Clears the deleted images list and if a property or unit is selected, it converts the image URLs to base64 strings.
   */
  ngOnInit(): void {
    this.propertyService.clearDeletedImages();
    //this.unitService.clearDeletedImages();   TODO : whats that, do we need it ?
    const property = this.propertyService.selectedProperty();
    const unit = this.unitService.selectedUnit();
    this.existingImageBase64s = [];
    const imagesToConvert = property?.images || unit?.images || [];
    imagesToConvert.forEach((image) => {
      this.convertImageUrlToBase64(getMediaUrl(image.image)).then((base64) =>
        this.existingImageBase64s.push(base64)
      );
    });
  }

  /**
   * Converts an image URL to a base64 string.
   * @param url The URL of the image to convert.
   * @returns A promise that resolves with the base64 string.
   */
  convertImageUrlToBase64(url: string): Promise<string> {
    return fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }

  /**
   * Called when the user selects new images to upload.
   * It checks that the selected images are not too big (max 500KB) and that there are not more than 30 images in total.
   * If one of the files is too big, it sets the imageTooBig signal to the name of the file and continues to the next file.
   * If there are already 30 images, it sets the maxImagesReached signal to true and stops processing the rest of the files.
   * It also checks that the file is not already in the list of images to upload. If it is, it continues to the next file.
   * For each file that passes all the checks, it reads the file as a data URL and adds it to the list of images to upload.
   * It also adds a new empty string to the list of new image descriptions.
   * It emits the new list of images and the new list of new image descriptions.
   * Finally, it resets the file input value to an empty string, so that the same image can be selected again.
   * @param event The event that triggered this method.
   */
  onImageChange(event: Event): void {
    this.imageTooBig.set('');
    this.maxImagesReached.set(false);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files: File[] = Array.from(input.files);
      for (const file of files) {
        if (this.images.length >= 30) {
          this.maxImagesReached.set(true);
          break;
        }
        if (file.size > 500 * 1024) {
          this.imageTooBig.set(file.name);
          continue;
        }
        if (this.images.find((f) => f.name === file.name)) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          if (this.existingImageBase64s.includes(base64)) return;
          this.imagePreviews.push(base64);
          this.images.push(file);
          this.newImageDescriptions.push('');
          this.imagesChange.emit(this.images);
          this.newImageDescriptionsChange.emit(this.newImageDescriptions);
          this.missingDescriptionChange.emit(this.hasMissingDescriptions());
        };
        reader.readAsDataURL(file);
      }
      input.value = '';
    }
  }

  /**
   * Removes a preview from the list of images to upload and updates the respective lists and outputs.
   * @param preview The base64 string of the image to remove.
   */
  removePreview(preview: string): void {
    const index = this.imagePreviews.indexOf(preview);
    if (index > -1) {
      this.imagePreviews.splice(index, 1);
      this.images.splice(index, 1);
      this.newImageDescriptions.splice(index, 1);
      this.imagesChange.emit(this.images);
      this.newImageDescriptionsChange.emit(this.newImageDescriptions);
      this.missingDescriptionChange.emit(this.hasMissingDescriptions());
    }
  }

  /**
   * Removes an image with the given id from the list of images to upload by marking it for deletion.
   * @param id The id of the image to remove.
   */
  deleteImage(id: number) {
    this.propertyService.markImageForDeletion(id);
  }

  /**
   * Updates the alt text of an existing image by its id.
   *
   * This method updates the alt text of an image associated with the currently
   * selected property or unit. If no property or unit is selected, the method
   * does nothing.
   * @param imageId - The id of the image to update.
   * @param desc - The new alt text for the image.
   */
  updateExistingImageDescription(imageId: number, desc: string) {
    const property = this.propertyService.selectedProperty();
    const unit = this.unitService.selectedUnit();
    if (property) {
      const image = property.images.find((img) => img.id === imageId);
      if (image) {
        image.alt_text = desc;
      }
    }
    if (unit) {
      const image = unit.images.find((img) => img.id === imageId);
      if (image) {
        image.alt_text = desc;
      }
    }
  }

  /**
   * Checks if there are any missing descriptions for the images to be uploaded.
   * A description is considered missing if it is an empty string.
   * The method returns true if there are any missing descriptions and false otherwise.
   * It also updates the missingDescription signal with the result.
   * @returns True if there are any missing descriptions, false otherwise.
   */
  hasMissingDescriptions(): boolean {
    const existing = this.propertyService.selectedProperty()?.images ?? [];
    const missingInExisting = existing.some((img) => !img.alt_text?.trim());
    const missingInNew = this.newImageDescriptions.some(
      (desc) => !desc?.trim()
    );
    this.missingDescription = missingInExisting || missingInNew;
    return this.missingDescription;
  }

  /**
   * Emits the result of hasMissingDescriptions() on the missingDescriptionChange signal,
   * which indicates whether there are any missing descriptions for the images to be uploaded.
   * This method is called whenever a description is changed, added, or removed.
   */
  onDescriptionChange(): void {
    const result = this.hasMissingDescriptions();
    this.missingDescriptionChange.emit(result);
  }
}
