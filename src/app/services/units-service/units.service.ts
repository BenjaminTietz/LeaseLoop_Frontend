import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Unit } from '../../models/unit.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaginatedResponse } from '../../models/paginated-response.model';
@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  httpService = inject(HttpService);
  http = inject(HttpClient);
  units = signal<Unit[]>([]);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  selectedUnit = signal<Unit | null>(null);
  deletedImageIds = signal<number[]>([]);
  totalPages = signal(1);
  currentPage = signal(1);
  filterValue = signal('');

  /** Load all units (admin or general fetch) */
  loadUnits() {
    this.setLoading(true);
    this.httpService
      .get<Unit[]>(`${environment.apiBaseUrl}/api/units/`)
      .subscribe({
        next: (data) => {
          this.units.set(
            data.slice().sort((a, b) => {
              return (b.active ? 1 : 0) - (a.active ? 1 : 0);
            })
          );
          this.setLoading(false);
        },
        error: this.handleError('Failed to load Ünits'),
      });
  }

  /**
   * Loads paginated units from the API and updates the units signal.
   *
   * This method sets the loading state to true while the request is in progress
   * and resets it to false once the request completes. It sorts the units by
   * their active status in descending order and updates the current page and
   * total pages signals with the response data.
   *
   * In case of an error, it handles the error by calling a custom error handler.
   *
   * @param page The page number to load.
   * @param searchTerm Optional search term to filter the units by.
   */
  loadPaginatedUnits(page: number, searchTerm: string = '') {
    this.setLoading(true);
    this.httpService
      .get<PaginatedResponse<Unit>>(
        `${
          environment.apiBaseUrl
        }/api/units/?page=${page}&search=${searchTerm}&filter=${this.filterValue()}`
      )
      .subscribe({
        next: (data) => {
          this.units.set(
            data.results.slice().sort((a, b) => {
              return (b.active ? 1 : 0) - (a.active ? 1 : 0);
            })
          );
          this.totalPages.set(data.total_pages);
          this.currentPage.set(page);
          this.setLoading(false);
        },
        error: this.handleError('Failed to load Ünits'),
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
    this.http
      .post<Unit>(this.getUrl('units'), formData, this.getAuthOptions())
      .subscribe({
        next: (unit) => {
          this.uploadImages(unit.id, images, descriptions);
          this.onSuccess();
        },
        error: this.handleError('Create Unit failed'),
      });
  }

  /** Update a unit */
  updateUnit(
    formData: FormData,
    newImages: File[] = [],
    descriptions: string[] = [],
    onComplete?: () => void
  ) {
    const id = this.selectedUnit()?.id;
    if (!id) return;
    this.setLoading(true);
    this.http
      .patch<Unit>(this.getUrl(`unit/${id}`), formData, this.getAuthOptions())
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
        },
      });
  }

  /** Delete a unit */
  deleteUnit() {
    const id = this.selectedUnit()?.id;
    if (!id) return;
    this.httpService.delete<Unit>(this.getUrl(`unit/${id}`)).subscribe({
      next: () => {
        this.selectedUnit.set(null);
        this.loadPaginatedUnits(this.currentPage());
        this.successful.set(true);
      },
      error: this.handleError('Delete property failed'),
    });
  }

  /**
   * Deletes an image by its ID.
   *
   * Sends a DELETE request to the `unit-image/:id` endpoint to remove the image.
   * Resolves the promise if the request is successful, otherwise rejects it with an error.
   *
   * @param id - The ID of the image to delete.
   * @returns A Promise that resolves on successful deletion, or rejects with an error.
   */
  deleteImage(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .delete(this.getUrl(`unit-image/${id}`), this.getAuthOptions())
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error('Failed to delete image', err);
            reject(err);
          },
        });
    });
  }

  /**
   * Returns a URL by prepending the API base URL, the string '/api/', and the specified path.
   * The URL is guaranteed to end with a trailing slash.
   * @param path The path to append to the API base URL.
   * @returns The constructed URL.
   */
  getUrl(path: string): string {
    return `${environment.apiBaseUrl}/api/${path}/`;
  }

  /**
   * Returns a callback function that handles an error by logging the error to the
   * console, setting the `successful` signal to `false` and the `sending` signal to
   * `false`.
   *
   * @param context - The context in which the error occurred, used for logging.
   * @returns {function(any): void} - A callback function that takes an error object
   * as an argument.
   */
  handleError(context: string) {
    return (error: any) => {
      console.error(`${context}:`, error);
      this.successful.set(false);
      this.setLoading(false);
    };
  }

  /**
   * Sets the `sending` signal to the given state.
   * @param state Whether the service is currently sending a request.
   */
  setLoading(state: boolean) {
    this.sending.set(state);
  }

  /**
   * Called when a request is successful.
   *
   * Sets the `successful` signal to `true`, reloads the current page of units,
   * and sets the `sending` signal to `false`.
   */
  onSuccess() {
    this.successful.set(true);
    this.loadPaginatedUnits(this.currentPage());
    this.setLoading(false);
  }

  /**
   * Uploads the given files as images for the unit with the given unitId.
   *
   * If the `descriptions` parameter is provided, it should contain alt text
   * descriptions for the images. If a description is not provided for an image,
   * an empty string is used as the description instead.
   *
   * @param unitId The ID of the unit to which the images belong.
   * @param files The files to upload.
   * @param descriptions The alt text descriptions for the images, or an empty
   * array if no descriptions are provided.
   */
  uploadImages(unitId: number, files: File[], descriptions: string[] = []) {
    if (!files || files.length == 0) return;
    files.forEach((file, i) => {
      const form = new FormData();
      form.append('unit', String(unitId));
      form.append('image', file);
      form.append('alt_text', descriptions?.[i]?.trim() || '');
      this.http
        .post(this.getUrl('unit-images'), form, this.getAuthOptions())
        .subscribe({
          error: (err) => console.error('Image upload failed:', err),
        });
    });
  }

  /**
   * Returns an object containing headers for authenticated requests.
   *
   * If there is a token stored in local storage, an object with an
   * Authorization header set to "Token <token>" is returned. Otherwise,
   * an empty object is returned.
   *
   * @returns An object containing headers for authenticated requests, or
   * an empty object if there is no stored token.
   */
  getAuthOptions() {
    const token = this.httpService.getToken();
    return token
      ? { headers: new HttpHeaders().set('Authorization', `Token ${token}`) }
      : {};
  }

  /**
   * Updates the alt text of an image by its ID.
   *
   * Calls the API's `PATCH /unit-image/:id` endpoint to update the image.
   * If the request is successful, resolves the returned Promise.
   * If the request fails, rejects the returned Promise with the error.
   * @param id - The ID of the image to update.
   * @param desc - The new alt text for the image.
   * @returns A Promise that resolves if the request is successful, or rejects if the request fails.
   */
  updateImageDescription(id: number, desc: string): Promise<void> {
    const formData = new FormData();
    formData.append('alt_text', desc);
    return new Promise((resolve, reject) => {
      this.http
        .patch(this.getUrl(`unit-image/${id}`), formData, this.getAuthOptions())
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error('Failed to update unit image description', err);
            reject(err);
          },
        });
    });
  }

  /**
   * Updates the amenities of the currently selected unit to the given list.
   *
   * @param amenities The list of amenity IDs to set for the currently selected unit.
   *
   * This function sends a PATCH request to the API's `/unit/:id` endpoint to update
   * the unit. If the request is successful, it reloads the current page of units
   * and updates the selected unit's amenities. If the request fails, it logs the
   * error to the console.
   */
  patchAmenities(amenities: number[]) {
    const id = this.selectedUnit()?.id;
    if (!id) return;
    this.http
      .patch(this.getUrl(`unit/${id}`), { amenities }, this.getAuthOptions())
      .subscribe({
        next: () => {
          this.loadPaginatedUnits(this.currentPage());
          const current = this.selectedUnit();
          if (current) {
            this.selectedUnit.set({ ...current, amenities });
          }
        },
        error: this.handleError('Update unit failed'),
      });
  }

  /**
   * Marks an image for deletion by its ID.
   *
   * This method removes the image with the specified ID from the selected unit's images
   * and adds the ID to the list of deleted image IDs. The image is not immediately deleted from
   * the database; instead, it is marked for deletion, allowing batch processing of deletions.
   *
   * @param id - The ID of the image to mark for deletion.
   */
  markImageForDeletion(id: number) {
    const unit = this.selectedUnit();
    if (!unit) return;
    unit.images = unit.images.filter((img) => img.id !== id);
    this.deletedImageIds.set([...this.deletedImageIds(), id]);
  }
}



