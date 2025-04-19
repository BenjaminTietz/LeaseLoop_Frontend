import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Property } from '../../models/property.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PropertiesService {
  httpService = inject(HttpService);
  sending = signal(false);
  selectedProperty = signal<Property | null>(null);
  properties = signal<Property[]>([])
  singleProperty = signal<Property | null>(null);
  successful = signal<boolean>(false);
  http = inject(HttpClient)
  deletedImageIds = signal<number[]>([]);
  


  loadProperties() {
    this.setLoading(true);
    this.httpService.get<Property[]>(`${environment.apiBaseUrl}/api/properties/`).subscribe({
      next: (data) => {
        this.properties.set(data.slice().sort((a, b) => {
          return (b.active ? 1 : 0) - (a.active ? 1 : 0)
        }));
        this.setLoading(false);
      },
      error: this.handleError('Failed to load properties')
    });
  }

  createProperty(formData: FormData, images: File[], descriptions: string[]) {
    this.setLoading(true);
    this.http.post<Property>(this.getUrl('properties'), formData, this.getAuthOptions())
      .subscribe({
        next: (property) => {
          this.uploadImages(property.id, images, descriptions);
          this.onSuccess();
        },
        error: this.handleError('Create property failed')
      });
  }

  updateProperty(formData: FormData, newImages: File[] = [], descriptions: string[] = [], onComplete?: () => void) {
    const id = this.selectedProperty()?.id;
    if (!id) return;
    this.setLoading(true);
    this.http.patch<Property>(this.getUrl(`properties/${id}`), formData, this.getAuthOptions())
      .subscribe({
        next: () => {
          if (Array.isArray(newImages) && newImages.length > 0) {
            this.uploadImages(id, newImages, descriptions ?? []);
          }
          this.successful.set(true);
        },
        error: this.handleError('Update property failed'),
        complete: () => {
          this.setLoading(false);
          onComplete?.();
        }
      });
  }

  deleteProperty() {
    const id = this.selectedProperty()?.id;
    if (!id) return;
    this.httpService.delete<Property>(this.getUrl(`properties/${id}`)).subscribe({
      next: () => {
        this.selectedProperty.set(null);
        this.loadProperties();
        this.successful.set(true);
      },
      error: this.handleError('Delete property failed')
    });
  }

  deleteImage(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(this.getUrl(`property-image/${id}`), this.getAuthOptions()).subscribe({
        next: () => resolve(),
        error: (err) => {
          console.error('Failed to delete image', err);
          reject(err);
        }
      });
    });
  }

  markImageForDeletion(id: number) {
    const property = this.selectedProperty();
    if (!property) return;
    property.images = property.images.filter(img => img.id !== id);
    this.deletedImageIds.set([...this.deletedImageIds(), id]);
  }

  clearDeletedImages() {
    this.deletedImageIds.set([]);
  }

  getUrl(path: string): string {
    return `${environment.apiBaseUrl}/api/${path}/`;
  }

  getAuthOptions() {
    const token = this.httpService.getToken();
    return token ? { headers: new HttpHeaders().set('Authorization', `Token ${token}`) } : {};
  }

  uploadImages(propertyId: number, files: File[], descriptions: string[] = []) {
    if(!files || files.length == 0) return;
    files.forEach((file, i) => {
      const form = new FormData();
      form.append('property', String(propertyId));
      form.append('image', file);
      form.append('alt_text', descriptions?.[i]?.trim() || '');
  
      this.http.post(this.getUrl('property-images'), form, this.getAuthOptions())
        .subscribe({
          error: (err) => console.error('Image upload failed:', err)
        });
    });
  }

  updateImageDescription(id: number, desc: string): Promise<void> {
    const formData = new FormData();
    formData.append('alt_text', desc);
  
    return new Promise((resolve, reject) => {
      this.http.patch(this.getUrl(`property-image/${id}`), formData, this.getAuthOptions()).subscribe({
        next: () => resolve(),
        error: (err) => {
          console.error('Failed to update image description', err);
          reject(err);
        }
      });
    });
  }

  handleError(context: string) {
    return (error: any) => {
      console.error(`${context}:`, error);
      this.successful.set(false);
      this.setLoading(false);
    };
  }

  setLoading(state: boolean) {
    this.sending.set(state);
  }

  onSuccess() {
    this.loadProperties();
    this.successful.set(true);
    this.setLoading(false);
  }
}
