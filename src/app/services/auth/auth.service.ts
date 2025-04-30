import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from '../httpclient/http.service';
import { NavigatorService } from '../navigator/navigator.service';

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;
  httpService = inject(HttpService);
  navigator = inject(NavigatorService)
  loginData = signal({});
  resetToken = signal('')
  remember = signal(false);
  sending = signal<boolean>(false);
  registerData = signal({});
  successful = signal<boolean>(false)
  forgotEmail = signal('')
  resetData = signal({})
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor() {
    
  }

  setUserDataStorage(user:any) {
    localStorage.setItem('user', JSON.stringify(user));
  }


  login() {
    this.sending.set(true);
    this.httpService.post<{ message: string }>(
      `${this.apiUrl}/auth/login/`, this.loginData()
    ).subscribe({
      next: (response) => this.successfulLogin(response),
      error: (error) => this.handleError(error, 'Login failed. Please try again.')
    });
  }

  successfulLogin(response: any) {
    if (response.token) {
      this.settokentostorage(response);
      this.sending.set(false);
      this.setUserDataStorage(response);
      this.navigator.navigateTo('/dashboard');
    }
  }

  settokentostorage(response: any) {
    if (this.remember()) {
      localStorage.setItem('token', response.token);
    } else {
      sessionStorage.setItem('token', response.token);
    }
  }

  rememberedLogin() {
    const remembertoken = localStorage.getItem('token');
    if (!remembertoken) return;
    this.sending.set(true);
    this.httpService.post<{ remembertoken: string; message: string }>(
      `${this.apiUrl}/auth/remember-login/`, { token: remembertoken }
    ).subscribe({
      next: (response) => this.succesfullRememberLogin(response),
      error: (error) => this.handleError(error, 'Remember login failed. Please try again.')
    });
  }

  succesfullRememberLogin(response: any) {
    if (response.token) {
      this.handleSuccess();
      this.setUserDataStorage(response);
      this.navigator.navigateTo('/dashboard');
    }
  }

  register() {
    this.sending.set(true);
    this.httpService.post<{ message: string }>(
      `${this.apiUrl}/auth/register/`, this.registerData()
    ).subscribe({
      next: (response) => this.handleSuccess(response.message),
      error: (error) => this.handleError(error, 'Registration failed. Please try again.')
    });
  }
  
  sendResetPasswordEmail() {
    this.sending.set(true);
    this.httpService.post<{ message: string }>(
      `${this.apiUrl}/auth/forgot-password/`, { email: this.forgotEmail() }
    ).subscribe({
      next: (response) => {
        this.forgotEmail.set('');
        this.handleSuccess(response.message);
      },
      error: (error) => this.handleError(error, 'Failed to send reset password email.')
    });
  }

  resetPassword() {
    this.sending.set(true);
    this.httpService.post<{ message: string }>(
      `${this.apiUrl}/auth/reset-password/${this.resetToken()}/`, this.resetData()
    ).subscribe({
      next: (response) => {
        this.resetToken.set('');
        this.resetData.set({});
        this.handleSuccess(response.message);
      },
      error: (error) => this.handleError(error, 'Password reset failed. Please try again.')
    });
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.navigator.navigateTo('/login');
    this.loginData.set({});
  }

  activateAccount(uid: string, token: string): void {
    this.sending.set(true);
    this.httpService.get<{ message: string }>(
      `${this.apiUrl}/auth/activate-account/${uid}/${token}/`
    ).subscribe({
      next: (response) => {
        this.handleSuccess(response.message);
      },
      error: (error) => this.handleError(error, 'Account activation failed.')
    });
  }

  handleSuccess(message?: string) {
    this.successful.set(true);
    this.sending.set(false);
    if (message){
      this.successMessage.set(message);
      this.error.set(null);
    }
  }
  
  handleError(error: any, fallbackMessage: string = 'Something went wrong.') {
    console.log(error);
    const msg = error?.error?.message || error?.error?.error || error?.error?.detail || fallbackMessage;
    this.error.set(msg);
    this.successMessage.set(null);
    console.log(msg);
    
    this.sending.set(false);
  }

  resetMessages() {
    this.error.set(null);
    this.successMessage.set(null);
  }

  loginDemo() {
    this.loginData.set({ email: 'guest@exampless.com', password: 'guest1234BB!!' });
    this.login();
  }
}
