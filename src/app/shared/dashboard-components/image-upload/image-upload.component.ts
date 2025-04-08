import { Component, inject } from '@angular/core';
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {
    imagePreviews: string[] = [];
    images: any[] = [];
    existingImageBase64s: string[] = [];
    newImageDescriptions: string[] = [];
    propertyService = inject(PropertiesService)

    ngOnInit(): void {
      this.propertyService.clearDeletedImages();
      const selected = this.propertyService.selectedProperty();
      if (selected) {
        // Reset and load base64s
        this.existingImageBase64s = [];
      
        selected.images.forEach((image) => {
          this.convertImageUrlToBase64('http://localhost:8000' + image.image)
            .then((base64) => this.existingImageBase64s.push(base64));
        });
      }
    }

    convertImageUrlToBase64(url: string): Promise<string> {
      return fetch(url)
        .then(res => res.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));
    }

    onImageChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        const files: File[] = Array.from(input.files);
    
        for (const file of files) {
          // Check for name-based duplicates in current uploads
          if (this.images.find(f => f.name === file.name)) {
            console.warn(`Duplicate upload: ${file.name}`);
            continue;
          }
    
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
    
            // Check for duplicate content against backend base64s
            if (this.existingImageBase64s.includes(base64)) {
              console.warn(`Image already exists in backend: ${file.name}`);
              return;
            }
    
            this.imagePreviews.push(base64);
            this.images.push(file);
            this.newImageDescriptions.push('');
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
      }
    }

    deleteImage(id: number) {
      this.propertyService.markImageForDeletion(id);
    }

    updateExistingImageDescription(imageId: number, desc: string) {
      const property = this.propertyService.selectedProperty();
      if (!property) return; // prevent errors
    
      const image = this.propertyService.selectedProperty()!.images.find(img => img.id === imageId);
      if (image) {
        image.alt_text = desc;
      }
    }
  
    hasMissingDescriptions(): boolean {
      // Check backend images
      const existing = this.propertyService.selectedProperty()?.images ?? [];
      const missingInExisting = existing.some(img => !img.alt_text?.trim());
    
      // Check new uploaded images
      const missingInNew = this.newImageDescriptions.some(desc => !desc?.trim());
    
      return missingInExisting || missingInNew;
    }
}
