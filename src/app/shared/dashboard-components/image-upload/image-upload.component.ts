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
import { environment } from '../../../../environments/environment';
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
  mediaUrl = environment.mediaBaseUrl;
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


    getMediaUrl = getMediaUrl

    ngOnInit(): void {
      this.propertyService.clearDeletedImages();
      //this.unitService.clearDeletedImages();
      const property = this.propertyService.selectedProperty();
      const unit = this.unitService.selectedUnit();
    
      this.existingImageBase64s = [];
    
      const imagesToConvert = property?.images || unit?.images || [];
    
      imagesToConvert.forEach((image) => {
        this.convertImageUrlToBase64(getMediaUrl(image.image))
          .then((base64) => this.existingImageBase64s.push(base64));
      });
    }


    this.existingImageBase64s = [];

    const imagesToConvert = property?.images || unit?.images || [];

    imagesToConvert.forEach((image) => {
      this.convertImageUrlToBase64(this.mediaUrl + image.image).then((base64) =>
        this.existingImageBase64s.push(base64)
      );
    });
  }

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

  deleteImage(id: number) {
    this.propertyService.markImageForDeletion(id);
  }

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

  hasMissingDescriptions(): boolean {
    const existing = this.propertyService.selectedProperty()?.images ?? [];
    const missingInExisting = existing.some((img) => !img.alt_text?.trim());
    const missingInNew = this.newImageDescriptions.some(
      (desc) => !desc?.trim()
    );

    this.missingDescription = missingInExisting || missingInNew;
    return this.missingDescription;
  }

  onDescriptionChange(): void {
    const result = this.hasMissingDescriptions();
    this.missingDescriptionChange.emit(result);
  }
}
