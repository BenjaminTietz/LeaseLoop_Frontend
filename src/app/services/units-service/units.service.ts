import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Unit } from '../../models/unit.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  http = inject(HttpClient)
  units = signal<Unit[]>([]);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  selectedUnit = signal<Unit | null>(null);

  /** Load all units (admin or general fetch) */
  loadUnits() {
    this.http
      .get<Unit[]>(`${environment.apiBaseUrl}/api/units/`)
      .subscribe({
        next: (data) => this.units.set(data),
        error: (error) => console.error('Failed to load units', error),
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
  updateUnit(id: number, data: Partial<Unit>) {
    return this.http.patch<Unit>(
      `${environment.apiBaseUrl}/api/units/${id}/`,
      data
    );
  }

  /** Delete a unit */
  deleteUnit(id: number) {
    return this.http.delete(
      `${environment.apiBaseUrl}/api/units/${id}/`
    );
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
      const token = localStorage.getItem('token');
      return token ? { headers: new HttpHeaders().set('Authorization', `Token ${token}`) } : {};
  }
}
