import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Property } from '../../models/property.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, tap } from 'rxjs';
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
  


  loadProperties() {
   this.httpService.get<Property[]>(`${environment.apiBaseUrl}/api/properties/`).subscribe({
     next: (data) => this.properties.set(data),
     error: (error) => console.error('Failed to load properties', error)
   })
  }


  /** Create a new property */
  createProperty(formData: FormData, images: File[]): void {
    this.sending.set(true);
  
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders().set('Authorization', `Token ${token}`) : undefined;
  
    this.http.post<Property>(`${environment.apiBaseUrl}/api/properties/`, formData, { headers }).subscribe({
      next: (property) => {
        this.uploadImages(property.id, images);
        this.loadProperties();
        this.sending.set(false);
        this.successful.set(true);
      },
      error: (err) => {
        this.sending.set(false);
        this.successful.set(false);
        console.error(err);
      }
    });
  }

  uploadImages(propertyId: number, files: File[]): void {
  const token = localStorage.getItem('token');
  const headers = token ? new HttpHeaders().set('Authorization', `Token ${token}`) : undefined;

  files.forEach(file => {
    const imageForm = new FormData();
    imageForm.append('property', String(propertyId));
    imageForm.append('image', file);

    this.http.post(`${environment.apiBaseUrl}/api/property-images/`, imageForm, { headers }).subscribe({
      next: (res) => console.log('Image uploaded:', res),
      error: (err) => console.error('Image upload failed:', err)
    });
  });
}

  /** Update an existing property */
  updateProperty( data: Partial<Property>) {
    this.httpService.patch<Property>(
      `${environment.apiBaseUrl}/api/properties/${this.selectedProperty()?.id}/`,
      data
    ).subscribe({
      next: (response) => {
        console.log('Property updated successfully:', response);
        this.loadProperties();
        this.selectedProperty.set(null);
        this.successful.set(true);
      },
      error: (error) => {
        console.error('Failed to update property:', error);
        this.successful.set(false);
      }
    })
  }

  /** Delete a property */
  deleteProperty() {
    this.httpService.delete<Property>(`${environment.apiBaseUrl}/api/properties/${this.selectedProperty()?.id}/`).subscribe({
      next: (response) => {
        console.log('Property deleted successfully:', response);
        this.selectedProperty.set(null);
        this.loadProperties();
        this.successful.set(true);	
      },
      error: (error) => {
        console.error('Failed to delete property:', error);
        this.successful.set(false);
      }
    })
  }
}
