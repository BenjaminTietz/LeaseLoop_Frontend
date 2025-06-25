import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from '../httpclient/http.service';
import { HttpClient } from '@angular/common/http';
import { getMediaUrl } from '../../utils/media-path.utils';

export interface UserData {
  tax_id: string;
  first_name: string;
  last_name: string;
  email: string;
  data_filled: boolean;
  address: {
    street: string;
    house_number: string;
    city: string;
    country: string;
    postal_code: string;
    phone: string;
  };
  image: {
    logo: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  http = inject(HttpClient);
  httpService = inject(HttpService);
  baseURL = environment.apiBaseUrl;
  sending = signal(false);
  successful = signal(false);
  errorMessage = signal('');
  userLogo = signal('');
  userSignal = signal(this.getStoredUser());
  loggedInUserData = computed(() => this.userSignal());
  newUserData = signal<UserData>({} as UserData);

  userId = computed(() => {
    return this.loggedInUserData().id;
  });

  userEmail = computed(() => {
    return this.loggedInUserData().email;
  });

  logoPath = computed(() => {
    return this.userLogo() && this.userLogo() !== 'null'
      ? getMediaUrl(this.userLogo())
      : '';
  });

  isGuestEmail = computed(() => {
    return this.loggedInUserData().email === 'guest@exampless.com';
  });

  /**
   * Retrieves the stored user data from local or session storage.
   *
   * This function checks local storage first for a 'user' item. If not found,
   * it checks session storage. The stored string is parsed into an object
   * and returned. If no user data is found, it returns null.
   *
   * @returns The parsed user object or null if no user data is stored.
   */
  getStoredUser() {
    const userStr =
      localStorage.getItem('user') ?? sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Changes the user's logo image.
   *
   * This function patches the user's logo image on the server by sending a
   * PATCH request to the `/auth/logo/` endpoint with a FormData object
   * containing the logo image and the user ID. The function sets the `sending`
   * property of the service to `true` while the request is being sent and
   * sets the `successful` property to `true` if the request is successful.
   *
   * @param file The logo image file to upload.
   */
  changeImage(file: File) {
    this.sending.set(true);
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('user', this.userId());
    this.http
      .patch(this.baseURL + `/auth/logo/`, formData, this.getAuthOptions())
      .subscribe({
        next: () => {
          this.getLogo(), this.sending.set(false), this.successful.set(true);
        },
        error: (err) => {
          console.error(err),
            this.sending.set(false),
            this.successful.set(false);
        },
      });
  }

  getAuthOptions = () => ({
    headers: {
      Authorization: `Token ${this.httpService.getToken()}`,
    },
  });

  /**
   * Fetches the user's logo image from the server.
   *
   * This function sends an HTTP GET request to the `/auth/logo/` endpoint
   * to retrieve the user's logo image. If the request is successful, the
   * `userLogo` signal is updated with the logo image URL. In case of an
   * error, the error is logged to the console.
   */
  getLogo() {
    this.http
      .get(this.baseURL + `/auth/logo/`, this.getAuthOptions())
      .subscribe({
        next: (res) => {
          this.userLogo.set((res as any).logo);
        },
        error: (err) => console.error(err),
      });
  }

  /**
   * Sends a request to change the user's password.
   *
   * @description
   * This function sets the `sending` signal to `true` to indicate that the
   * password change request is being processed. It sends a PATCH request
   * to the server with the new password data. If the request is successful,
   * the `successful` signal is set to `true`. If the request fails, it sets
   * the `successful` and `sending` signals to `false` and updates the
   * `errorMessage` signal with the error detail.
   *
   * @param data The new password data to be sent to the server.
   */
  changePassword(data: any) {
    this.sending.set(true);
    this.httpService
      .patch(this.baseURL + `/auth/change-password/`, data)
      .subscribe({
        next: () => {
          this.sending.set(false), this.successful.set(true);
        },
        error: (err) => {
          if (err.error) {
            this.successful.set(false);
            this.sending.set(false);
            this.errorMessage.set(err.error.detail[0]);
          }
        },
      });
  }

  /**
   * Sends a request to change the user's email address.
   *
   * @description
   * This function sets the `sending` signal to `true` to indicate that the
   * email change request is being processed. It sends a PATCH request
   * to the server with the new email data. If the request is successful,
   * the `successful` signal is set to `true` and the user's email address
   * is updated in the local storage. If the request fails, it sets
   * the `successful` and `sending` signals to `false` and updates the
   * `errorMessage` signal with the error detail.
   *
   * @param data The new email data to be sent to the server.
   */
  changeEmail(data: any) {
    this.sending.set(true);
    this.httpService
      .patch(this.baseURL + `/auth/change-email/`, data)
      .subscribe({
        next: () => {
          this.sending.set(false),
            this.successful.set(true),
            this.updateLocalStorageUserData({ email: data.new_email });
        },
        error: (err) => {
          if (err.error) {
            this.successful.set(false);
            this.errorMessage.set(err.error.detail[0]);
          }
        },
      });
  }

  /**
   * Updates the user's data in the local storage.
   *
   * @description
   * This function updates the user's data in the local storage with the
   * provided information. It takes an object with optional properties
   * `email`, `first_name`, and `last_name`. If the corresponding property
   * exists in the object, it updates the user's data with the new value.
   * If the property does not exist, it leaves the user's data as it is.
   *
   * It uses the `localStorage` if the user is logged in, otherwise it uses
   * the `sessionStorage`.
   *
   * @param {{ email?: string; first_name?: string; last_name?: string }}
   *   data The new data to be updated in the local storage.
   */
  updateLocalStorageUserData({
    email,
    first_name,
    last_name,
  }: {
    email?: string;
    first_name?: string;
    last_name?: string;
  }) {
    const storage = localStorage.getItem('user')
      ? localStorage
      : sessionStorage;
    const userStr = storage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    storage.setItem('user', JSON.stringify(user));
    this.userSignal.set(user);
  }

  /**
   * Sends a request to change the user's personal information.
   *
   * @description
   * This function sets the `sending` signal to `true` to indicate that the
   * personal information change request is being processed. It sends a PATCH
   * request to the server with the new personal information data. If the
   * request is successful, the `successful` signal is set to `true` and the
   * user's personal information is updated in the local storage. If the
   * request fails, it sets the `successful` and `sending` signals to `false`
   * and updates the `errorMessage` signal with the error detail.
   *
   * @param data The new personal information data to be sent to the server.
   */
  changePersonals(data: any) {
    this.sending.set(true);
    this.httpService
      .patch(this.baseURL + `/auth/change-personals/`, data)
      .subscribe({
        next: () => {
          this.sending.set(false),
            this.successful.set(true),
            this.updateLocalStorageUserData(data.first_name);
        },
        error: (err) => {
          if (err.error) {
            this.errorMessage.set(err.error.detail[0]);
          }
        },
      });
  }

  /**
   * Requests the user's full data from the server.
   *
   * @description
   * This function sets the `sending` signal to `true` to indicate that the
   * user full data request is being processed. It sends a GET request to the
   * server for the user's full data. If the request is successful, the
   * `successful` signal is set to `true` and the user's full data is updated
   * in the `newUserData` signal. If the request fails, it sets the
   * `successful` and `sending` signals to `false` and updates the
   * `errorMessage` signal with the error detail.
   */
  getUserFullData() {
    this.sending.set(true);
    this.httpService.get(this.baseURL + `/auth/get-full-user-data/`).subscribe({
      next: (data) => {
        this.sending.set(false),
          this.successful.set(true),
          this.newUserData.set(data as UserData);
      },
      error: (err) => {
        if (err.error) {
          this.successful.set(false);
          this.sending.set(false);
          this.errorMessage.set(err.error.detail[0]);
        }
      },
    });
  }
}
