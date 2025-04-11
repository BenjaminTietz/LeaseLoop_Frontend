import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Unit } from '../../models/unit.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  httpService = inject(HttpService)
  http = inject(HttpClient)
  units = signal<Unit[]>([]);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  selectedUnit = signal<Unit | null>(null);
  deletedImageIds = signal<number[]>([]);

  /** Load all units (admin or general fetch) */
  loadUnits() {
    this.setLoading(true);
        this.httpService.get<Unit[]>(`${environment.apiBaseUrl}/api/units/`).subscribe({
          next: (data) => {
            this.units.set(data);
            this.setLoading(false);
          },
          error: this.handleError('Failed to load Ünits')
      });
  }

  /** Get all units for a specific property */
  getUnitsForProperty(propertyId: number) {
    return this.http.get<Unit[]>(
      `${environment.apiBaseUrl}/api/properties/${propertyId}/units/`
    );
  }

  /** Create a unit */
  createUnit(formData: FormData, images: File[], descriptions: string[]) {
      this.setLoading(true);
      this.http.post<Unit>(this.getUrl('units'), formData, this.getAuthOptions())
        .subscribe({

          next: (unit) => {
            this.uploadImages(unit.id, images, descriptions);
            this.onSuccess();
          },
          error: this.handleError('Create Unit failed')
        });
    }

  /** Update a unit */
  updateUnit(formData: FormData, newImages: File[] = [], descriptions: string[] = [], onComplete?: () => void) {
    console.log('Uploading with:', this.selectedUnit()?.id);
    
      const id = this.selectedUnit()?.id;
      if (!id) return;
      this.setLoading(true);
      this.http.patch<Unit>(this.getUrl(`units/${id}`), formData, this.getAuthOptions())
        .subscribe({
          next: () => {
            if (Array.isArray(newImages) && newImages.length > 0) {
              this.uploadImages(id, newImages, descriptions ?? []);
            }
            this.successful.set(true);
          },
          error: this.handleError('Update unit failed'),
          complete: () => {
            this.setLoading(false);
            onComplete?.();
          }
        });
    }

  /** Delete a unit */

  deleteUnit() {
    const id = this.selectedUnit()?.id;
    if (!id) return;
    this.httpService.delete<Unit>(this.getUrl(`units/${id}`)).subscribe({
      next: () => {
        this.selectedUnit.set(null);
        this.loadUnits();
        this.successful.set(true);
      },
      error: this.handleError('Delete property failed')
    });
  }


  deleteImage(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(this.getUrl(`unit-image/${id}`), this.getAuthOptions()).subscribe({
        next: () => resolve(),
        error: (err) => {
          console.error('Failed to delete image', err);
          reject(err);
        }
      });
    });
  }

  getUrl(path: string): string {
    return `${environment.apiBaseUrl}/api/${path}/`;
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
    this.successful.set(true);
    this.setLoading(false);
  }

  uploadImages(unitId: number, files: File[], descriptions: string[] = []) {
    files.forEach((file, i) => {
      const form = new FormData();
      form.append('unit', String(unitId));
      form.append('image', file);
      form.append('alt_text', descriptions?.[i]?.trim() || '');

      console.log('Uploading with:', unitId); 
  
      this.http.post(this.getUrl('unit-images'), form, this.getAuthOptions())
        .subscribe({
          error: (err) => console.error('Image upload failed:', err)
        });
    });
  }

  getAuthOptions() {
      const token = this.httpService.getToken();
      return token ? { headers: new HttpHeaders().set('Authorization', `Token ${token}`) } : {};
  }

  updateImageDescription(id: number, desc: string): Promise<void> {
    const formData = new FormData();
    formData.append('alt_text', desc);
    return new Promise((resolve, reject) => {
      this.http.patch(this.getUrl(`unit-image/${id}`), formData, this.getAuthOptions()).subscribe({
        next: () => resolve(),
        error: (err) => {
          console.error('Failed to update unit image description', err);
          reject(err);
        }
      });
    });
  }
}
