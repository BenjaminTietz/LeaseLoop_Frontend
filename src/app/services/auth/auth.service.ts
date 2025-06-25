import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavigatorService } from '../navigator/navigator.service';

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  http = inject(HttpClient);
  navigator = inject(NavigatorService);
  loginData = signal({});
  resetToken = signal('');
  remember = signal(false);
  sending = signal<boolean>(false);
  registerData = signal({});
  successful = signal<boolean>(false);
  forgotEmail = signal('');
  resetData = signal({});
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  /**
   * Stores user data in local storage for use when the user returns to the site.
   * @param user The user object to store.
   */
  setUserDataStorage(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Logs in a user by sending a POST request to the `/auth/login/` endpoint
   * with the user's login data. If the request is successful, it will call
   * the `successfulLogin` method with the response. If the request fails,
   * it will call the `handleError` method with the error and a default error
   * message of 'Login failed. Please try again.'.
   */
  login() {
    this.sending.set(true);
    this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/login/`, this.loginData())
      .subscribe({
        next: (response) => this.successfulLogin(response),
        error: (error) =>
          this.handleError(error, 'Login failed. Please try again.'),
      });
  }

  /**
   * Called when a user logs in successfully.
   * @param response The response object returned by the server.
   * @description
   * If the response contains a token, it will be stored in local or session
   * storage, depending on whether the user has checked the 'Remember me'
   * checkbox or not. The user data will also be stored in local storage.
   * The method will then set the `sending` signal to `false` and navigate
   * the user to the dashboard.
   */
  successfulLogin(response: any) {
    if (response.token) {
      this.settokentostorage(response);
      this.sending.set(false);
      this.setUserDataStorage(response);
      this.navigator.navigateTo('owner/dashboard');
    }
  }

  /**
   * Sets the token to local or session storage, depending on whether the user has
   * checked the 'Remember me' checkbox or not.
   * @param response The response object returned by the server.
   */
  settokentostorage(response: any) {
    if (this.remember()) {
      localStorage.setItem('token', response.token);
    } else {
      sessionStorage.setItem('token', response.token);
    }
  }

  /**
   * Tries to login a user using the token stored in local storage.
   * If the token is found, it will be sent to the server to verify whether
   * the token is valid or not. If the token is valid, the server will return
   * the user data and a new token. The method will then set the `sending`
   * signal to `false` and set the user data in the AuthService.
   * @description
   * This method is called automatically when the app starts.
   */
  rememberedLogin() {
    const remembertoken = localStorage.getItem('token');
    if (!remembertoken) return;
    this.sending.set(true);
    this.http
      .post<{ remembertoken: string; message: string }>(
        `${this.apiUrl}/auth/remember-login/`,
        { token: remembertoken }
      )
      .subscribe({
        next: (response) => this.succesfullRememberLogin(response),
        error: (error) =>
          this.handleError(error, 'Remember login failed. Please try again.'),
      });
  }

  /**
   * Called when a user logs in successfully using the 'remember me'
   * feature.
   * @param response The response object returned by the server.
   * @description
   * If the response contains a token, it will be stored in local or session
   * storage, depending on whether the user has checked the 'Remember me'
   * checkbox or not. The user data will also be stored in local storage.
   * The method will then set the `sending` signal to `false` and navigate
   * the user to the dashboard.
   */
  succesfullRememberLogin(response: any) {
    if (response.token) {
      this.handleSuccess();
      this.setUserDataStorage(response);
      this.navigator.navigateTo('owner/dashboard');
    }
  }

  /**
   * Initiates the registration process by sending form data to the server.
   *
   * @description
   * This method sets the `sending` signal to `true` to indicate that the
   * registration process is in progress. It then sends a POST request to
   * the server with the registration data. If the registration is
   * successful, the success handler is called with the response message.
   * If the registration fails, an error handler is called with an error
   * message.
   */
  register() {
    this.sending.set(true);
    this.http
      .post<{ message: string }>(
        `${this.apiUrl}/auth/register/`,
        this.registerData()
      )
      .subscribe({
        next: (response) => this.handleSuccess(response.message),
        error: (error) =>
          this.handleError(error, 'Registration failed. Please try again.'),
      });
  }

  /**
   * Sends a request to the server to send a reset password email
   * to the user with the email address stored in the `forgotEmail`
   * signal.
   * @description
   * This method sets the `sending` signal to `true` to indicate that
   * the password reset email is being sent. It then sends a POST request
   * to the server with the email address. If the request is successful,
   * the success handler is called with the response message. The email
   * address is then reset to an empty string. If the request fails, an
   * error handler is called with an error message.
   */
  sendResetPasswordEmail() {
    this.sending.set(true);
    this.http
      .post<{ message: string }>(`${this.apiUrl}/auth/forgot-password/`, {
        email: this.forgotEmail(),
      })
      .subscribe({
        next: (response) => {
          this.forgotEmail.set('');
          this.handleSuccess(response.message);
        },
        error: (error) =>
          this.handleError(error, 'Failed to send reset password email.'),
      });
  }

  /**
   * Sends a request to reset the user's password using the token and data stored
   * in the `resetToken` and `resetData` signals.
   *
   * @description
   * This method sets the `sending` signal to `true` to indicate that the
   * password reset request is being sent. It then sends a POST request
   * to the server with the reset token and data. If the request is successful,
   * the success handler is called with the response message, and the reset
   * token and data are cleared. If the request fails, an error handler is
   * called with an error message.
   */
  resetPassword() {
    this.sending.set(true);
    this.http
      .post<{ message: string }>(
        `${this.apiUrl}/auth/reset-password/${this.resetToken()}/`,
        this.resetData()
      )
      .subscribe({
        next: (response) => {
          this.resetToken.set('');
          this.resetData.set({});
          this.handleSuccess(response.message);
        },
        error: (error) =>
          this.handleError(error, 'Password reset failed. Please try again.'),
      });
  }

  /**
   * Logs out the user by removing the token and user data from local and session storage,
   * and then navigates to the login page.
   * @description
   * This method clears the user's authentication state by removing the token and user data
   * from local and session storage. It then navigates to the login page, and resets the
   * login form data to an empty object.
   */
  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.navigator.navigateTo('owner/login');
    this.loginData.set({});
  }

  /**
   * Activates a user's account using the provided user ID and activation token.
   *
   * @param uid - The user ID to be activated.
   * @param token - The activation token associated with the user ID.
   * @description
   * Sends a GET request to the server endpoint to activate the user's account.
   * If the request is successful, the success handler is invoked with the response message.
   * If the request fails, an error handler is called with a specific error message.
   */
  activateAccount(uid: string, token: string): void {
    this.sending.set(true);
    this.http
      .get<{ message: string }>(
        `${this.apiUrl}/auth/activate-account/${uid}/${token}/`
      )
      .subscribe({
        next: (response) => {
          this.handleSuccess(response.message);
        },
        error: (error) => this.handleError(error, 'Account activation failed.'),
      });
  }

  /**
   * Handles a successful response by setting the `successful` signal to `true` and
   * the `sending` signal to `false`. If a message is provided, it is set as the
   * `successMessage` and the `error` is cleared. Called by various methods in the
   * service after a successful server response.
   * @param message - Optional message to be set as the `successMessage`.
   */
  handleSuccess(message?: string) {
    this.successful.set(true);
    this.sending.set(false);
    if (message) {
      this.successMessage.set(message);
      this.error.set(null);
    }
  }

  /**
   * Handles an error response by setting the `error` signal to a specific error message.
   * If no error message is found in the error response, a fallback message is used.
   * Called by various methods in the service after an unsuccessful server response.
   * @param error - The error object from the server response.
   * @param fallbackMessage - Optional fallback message to use if no error message is found.
   */
  handleError(error: any, fallbackMessage: string = 'Something went wrong.') {
    const msg =
      error?.error?.message ||
      error?.error?.error ||
      error?.error?.detail ||
      fallbackMessage;
    this.error.set(msg);
    this.successMessage.set(null);
    this.sending.set(false);
  }

  /**
   * Resets the `error` and `successMessage` signals to `null`, effectively clearing
   * any error or success messages.
   */
  resetMessages() {
    this.error.set(null);
    this.successMessage.set(null);
  }

  /**
   * Logs in as a demo user. Sets the `loginData` signal to the guest user's email and
   * password, and then calls the `login` method to log in.
   */
  loginDemo() {
    this.loginData.set({
      email: 'guest@exampless.com',
      password: 'guest1234BB!!',
    });
    this.login();
  }
}
