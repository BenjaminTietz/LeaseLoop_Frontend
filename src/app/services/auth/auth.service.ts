import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from '../httpclient/http.service';
import { NavigatorService } from '../navigator/navigator.service';

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

  readonly isAuthenticated = computed(() => this.loginData());

  constructor() {
    setInterval(() => {

    }, 3000)
  }


  login() {
    this.sending.set(true);
    this.httpService.post<{ token: string; message: string }>(`${this.apiUrl}/auth/login/`, this.loginData())
      .subscribe({
        next: (response) => { this.successfulLogin(response); },
        error: (error) => { this.setErrorLogin(error); }
      });
  }

  setErrorLogin(error: any) {
    const errorMessage = error.error.message || 'Login failed. Please try again.';
    // this.toastService.setNegativeMessage(errorMessage);
    this.sending.set(false);
  }

  successfulLogin(response: any) {
    if (response.token) {
      this.settokentostorage(response);
      this.sending.set(false);
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
    let remembertoken = localStorage.getItem('token');
    if (remembertoken) {
      this.sending.set(true);
      this.httpService.post<{ token: string; message: string }>(`${this.apiUrl}/auth/remember-login/`, { token: remembertoken })
        .subscribe({
          next: (response) => { this.succesfullRememberLogin(response); },
          error: (error) => { this.setErrorLogin(error) }
        })
    }
  }

  succesfullRememberLogin(response: any) {
    if (response.token) {
      this.navigator.navigateTo('/dashboard');
      this.sending.set(false);
    }
  }

  register() {
    this.sending.set(true);
    this.httpService.post<{ message: string }>(`${this.apiUrl}/auth/register/`, this.registerData())
      .subscribe({
        next: (response) => { this.setSuccessfullRegisterMessage(response); },
        error: (error) => { this.setErrorRegisterMessage(error); }
      })
  }

  setSuccessfullRegisterMessage(response: any) {
    // this.toastService.setPositiveMessage(response.message);
    this.successful.set(true);
    this.sending.set(false);
  }

  setErrorRegisterMessage(error: any) {
    const errorMessage = error.error.message || 'Registration failed. Please try again.';
    // this.toastService.setNegativeMessage(errorMessage);
    this.sending.set(false);
  }

  sendResetPasswordEmail() {
    this.sending.set(true);
    this.httpService.post<{ message: string }>(`${this.apiUrl}/auth/reset-password/`, { email: this.forgotEmail() })
      .subscribe({
        error: () => { this.setErrorResetPasswordMessage(); }
      });
  }

  setErrorResetPasswordMessage() {
    this.successful.set(true);
    this.forgotEmail.set('');
    this.sending.set(false);
  }

  resetPassword() {
    this.sending.set(true);
    this.httpService.post<{ message: string }>(`${this.apiUrl}/auth/reset-password/confirm/${this.resetToken()}/`, this.resetData())
      .subscribe({
        next: (response) => { this.setSucessfulResetedMessage(response); },
        error: (error) => { this.setErrorResetedPassword(error); }
      })
  }

  setSucessfulResetedMessage(response: any) {
    // this.toastService.setPositiveMessage(response.message);
    this.successful.set(true);
    this.resetToken.set('');
    this.resetData.set({});
    this.sending.set(false);
  }

  setErrorResetedPassword(error: any) {
    const errorMessage = error.error.error || 'Password reset email failed. Please try again.';
    // this.toastService.setNegativeMessage(errorMessage);
    this.sending.set(false);
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.navigator.navigateTo('/login');
    this.loginData.set({});
  }


  activateAccount(uid: string, token: string): void {
    this.httpService.get<{ message: string }>(`${this.apiUrl}/auth/activate-account/${uid}/${token}/`)
    .subscribe({
      next: (response) => {
        this.error.set('')
        setTimeout(() => this.navigator.navigateTo('/login'), 3000);
      },
      error: (error) => {
        this.error.set(error.error.error || 'Account activation failed.')
      }
    })    
  }
}
