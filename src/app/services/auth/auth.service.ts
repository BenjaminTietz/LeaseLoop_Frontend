import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

interface User {
  username: string;
  email?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;


  loginData = signal({});

  readonly isAuthenticated = computed(() => this.loginData());

  constructor(private http: HttpClient) {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && user) {
      this.loginData.set({ token, user: JSON.parse(user) });
    }
  }

  loginUser(
    credentials: { username: string; password: string },
    remember: boolean
  ) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login/`, credentials)
      .pipe(
        tap((res) => {
          const storage = remember ? localStorage : sessionStorage;
          storage.setItem('accessToken', res.token);
          storage.setItem('user', JSON.stringify(res.user));
          this.loginData.set(res);
        })
      );
  }

  logoutUser() {
    console.log('Logout user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    this.loginData.set({});
  }

  getToken(): string | null {
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }
}
