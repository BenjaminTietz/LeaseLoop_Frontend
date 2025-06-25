import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Property } from '../../models/property.model';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({ providedIn: 'root' })
export class PropertiesService {
  httpService = inject(HttpService);
  sending = signal(false);
  selectedProperty = signal<Property | null>(null);
  properties = signal<Property[]>([]);
  singleProperty = signal<Property | null>(null);
  successful = signal<boolean>(false);
  http = inject(HttpClient);
  deletedImageIds = signal<number[]>([]);
  totalPages = signal(1);
  currentPage = signal(1);
  filterValue = signal('');

  /**
   * Loads all properties for the current user.
   *
   * The method updates the `properties` signal with the list of properties.
   * The list of properties is sorted by `active` in descending order.
   * The method also sets the `sending` signal to `true` while the request is in progress,
   * and sets it to `false` when the request is completed.
   *
   * If the request fails, the method calls `handleError` with the error message
   * 'Failed to load properties'.
   */
  loadProperties() {
    this.setLoading(true);
    this.httpService
      .get<Property[]>(`${environment.apiBaseUrl}/api/properties/`)
      .subscribe({
        next: (data) => {
          this.properties.set(
            data.slice().sort((a, b) => {
              return (b.active ? 1 : 0) - (a.active ? 1 : 0);
            })
          );
          this.setLoading(false);
        },
        error: this.handleError('Failed to load properties'),
      });
  }

  /**
   * Loads paginated properties for the current user.
   *
   * The method updates the `properties` signal with the list of properties.
   * The list of properties is sorted by `active` in descending order.
   * The method also sets the `sending` signal to `true` while the request is in progress,
   * and sets it to `false` when the request is completed.
   *
   * If the request fails, the method calls `handleError` with the error message
   * 'Failed to load properties'.
   *
   * @param page The page of properties to load.
   * @param searchTerm Optional search term to filter the properties by.
   */
  loadPaginatedProperties(page: number, searchTerm: string = '') {
    this.setLoading(true);
    this.httpService
      .get<PaginatedResponse<Property>>(
        `${
          environment.apiBaseUrl
        }/api/properties/?page=${page}&search=${searchTerm}&filter=${this.filterValue()}`
      )
      .subscribe({
        next: (data) => {
          this.properties.set(
            data.results.slice().sort((a, b) => {
              return (b.active ? 1 : 0) - (a.active ? 1 : 0);
            })
          );
          this.totalPages.set(data.total_pages);
          this.currentPage.set(page);
          this.setLoading(false);
        },
        error: this.handleError('Failed to load properties'),
      });
  }

  /**
   * Creates a new property and uploads associated images.
   *
   * This method sends a POST request to create a new property using the provided
   * FormData object. It also uploads any associated images with their descriptions.
   * If the property creation is successful, the newly created property is set as the
   * selected property and the `onSuccess` method is called. In case of an error,
   * the `handleError` function is called with the message 'Create property failed'.
   *
   * @param formData - The FormData object containing property details.
   * @param images - An array of image files to be uploaded.
   * @param descriptions - An array of descriptions for the images.
   */
  createProperty(formData: FormData, images: File[], descriptions: string[]) {
    this.setLoading(true);
    this.http
      .post<Property>(
        this.getUrl('properties'),
        formData,
        this.getAuthOptions()
      )
      .subscribe({
        next: (property) => {
          this.selectedProperty.set(property);
          this.uploadImages(images, descriptions);
          this.onSuccess();
        },
        error: this.handleError('Create property failed'),
      });
  }

  /**
   * Updates the currently selected property with new data and uploads any new images.
   *
   * This method sends a PATCH request to update the property details using the provided
   * FormData object. If there are new images to upload, they are uploaded with their
   * descriptions. The method sets the `successful` signal to true upon successful
   * completion of the update. In case of an error, the `handleError` function is called
   * with the message 'Update property failed'. The `sending` signal is managed to
   * indicate the loading state during the request.
   *
   * @param formData - The FormData object containing updated property details.
   * @param newImages - An optional array of new image files to be uploaded.
   * @param descriptions - An optional array of descriptions for the new images.
   * @param onComplete - An optional callback function that is called after the update
   *                     operation is completed, regardless of success or failure.
   */
  updateProperty(
    formData: FormData,
    newImages: File[] = [],
    descriptions: string[] = [],
    onComplete?: () => void
  ) {
    this.setLoading(true);
    this.http
      .patch<Property>(
        this.getUrl(`properties/${this.selectedProperty()?.id}`),
        formData,
        this.getAuthOptions()
      )
      .subscribe({
        next: () => {
          if (Array.isArray(newImages) && newImages.length > 0) {
            this.uploadImages(newImages, descriptions ?? []);
          }
          this.successful.set(true);
        },
        error: this.handleError('Update property failed'),
        complete: () => {
          this.setLoading(false);
          onComplete?.();
        },
      });
  }

  /**
   * Deletes the currently selected property from the database.
   *
   * Calls the API's `DELETE /properties/:id` endpoint to delete the property.
   * If the request is successful, sets the `selectedProperty` signal to `null`,
   * reloads the paginated properties, and sets the `successful` signal to `true`.
   * If the request fails, calls the `handleError` function with the message
   * 'Delete property failed'.
   */
  deleteProperty() {
    const id = this.selectedProperty()?.id;
    if (!id) return;
    this.httpService
      .delete<Property>(this.getUrl(`properties/${id}`))
      .subscribe({
        next: () => {
          this.selectedProperty.set(null);
          this.loadPaginatedProperties(1);
          this.successful.set(true);
        },
        error: this.handleError('Delete property failed'),
      });
  }

  /**
   * Deletes an image by its ID.
   *
   * Calls the API's `DELETE /property-image/:id` endpoint to delete the image.
   * If the request is successful, resolves the returned Promise.
   * If the request fails, rejects the returned Promise with the error.
   * @param id The ID of the image to delete.
   * @returns A Promise that resolves if the request is successful, or rejects if the request fails.
   */
  deleteImage(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .delete(this.getUrl(`property-image/${id}`), this.getAuthOptions())
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
   * Marks an image for deletion by its ID.
   *
   * This method removes the image with the specified ID from the selected property's images
   * and adds the ID to the list of deleted image IDs. The image is not immediately deleted from
   * the database; instead, it is marked for deletion, allowing batch processing of deletions.
   *
   * @param id - The ID of the image to mark for deletion.
   */
  markImageForDeletion(id: number) {
    const property = this.selectedProperty();
    if (!property) return;
    property.images = property.images.filter((img) => img.id !== id);
    this.deletedImageIds.set([...this.deletedImageIds(), id]);
  }

  /**
   * Clears the list of deleted image IDs.
   *
   * This method sets the `deletedImageIds` signal to an empty array, effectively clearing
   * the list of deleted image IDs. This should be called after a successful update or
   * deletion of a property, to ensure that the list of deleted image IDs does not
   * persist across page reloads.
   */
  clearDeletedImages() {
    this.deletedImageIds.set([]);
  }

  /**
   * Constructs a URL by concatenating the API base URL, the string '/api/',
   * and the specified path.
   *
   * @param path - The path to append to the API base URL.
   * @returns The constructed URL.
   */
  getUrl(path: string): string {
    return `${environment.apiBaseUrl}/api/${path}/`;
  }

  /**
   * Returns an object containing authentication options for HTTP requests.
   *
   * If an authentication token is available, the returned object will contain
   * a 'headers' property with an HttpHeaders object containing the 'Authorization'
   * header set to `Token <token>`, where `<token>` is the value of the authentication
   * token. If no token is available, an empty object is returned.
   *
   * @returns An object containing authentication options for HTTP requests.
   */
  getAuthOptions() {
    const token = this.httpService.getToken();
    return token
      ? { headers: new HttpHeaders().set('Authorization', `Token ${token}`) }
      : {};
  }

  /**
   * Uploads images to a property.
   *
   * This method takes an array of File objects and an optional array of strings
   * containing alt text for each image. It creates a FormData object for each
   * image and appends the property ID, image file, and alt text to the form.
   * Then, it posts the form to the API at the 'property-images' endpoint.
   * If an error occurs during the upload, it logs the error to the console.
   *
   * @param files - An array of File objects to upload.
   * @param descriptions - An optional array of strings containing alt text for each image.
   */
  uploadImages(files: File[], descriptions: string[] = []) {
    if (!files || files.length == 0) return;
    files.forEach((file, i) => {
      const form = new FormData();
      form.append('property', String(this.selectedProperty()?.id));
      form.append('image', file);
      form.append('alt_text', descriptions?.[i]?.trim() || '');
      this.http
        .post(this.getUrl('property-images'), form, this.getAuthOptions())
        .subscribe({
          error: (err) => console.error('Image upload failed:', err),
        });
    });
  }

  /**
   * Updates the alt text of an image by its ID.
   *
   * Calls the API's `PATCH /property-image/:id` endpoint to update the image.
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
        .patch(
          this.getUrl(`property-image/${id}`),
          formData,
          this.getAuthOptions()
        )
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error('Failed to update image description', err);
            reject(err);
          },
        });
    });
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
   * Sets the `sending` signal to the given state. This signal is used to
   * track whether the service is currently sending a request.
   *
   * @param state - The state to set the `sending` signal to.
   */
  setLoading(state: boolean) {
    this.sending.set(state);
  }

  /**
   * A callback function that is called when a request is successful.
   *
   * Reloads the first page of properties, sets the `successful` signal to `true`,
   * and sets the `sending` signal to `false`.
   */
  onSuccess() {
    this.loadPaginatedProperties(1);
    this.successful.set(true);
    this.setLoading(false);
  }
}
