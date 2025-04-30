import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from '../httpclient/http.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  http  = inject(HttpClient)
  httpService = inject(HttpService)
  baseURL = environment.apiBaseUrl
  mediaUrl = environment.mediaBaseUrl
  sending = signal(false)
  successful = signal(false)
  errorMessage = signal('')
  userLogo = signal('')
  userSignal = signal(this.getStoredUser());
  loggedInUserData = computed(() => this.userSignal());
  newUserData = signal({})

  userId = computed(() => {
    return this.loggedInUserData().id
  });

  userEmail = computed(() => {
    return this.loggedInUserData().email;
  })

  logoPath = computed(() => {
    return this.mediaUrl + this.userLogo();
  })

  getStoredUser() {
    const userStr = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }


  changeImage(file:File){
    this.sending.set(true)
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('user', this.userId());
    this.http.patch(this.baseURL + `/auth/logo/`, formData, this.getAuthOptions()).subscribe({
      next: () => {this.getLogo(), this.sending.set(false), this.successful.set(true)},
      error: (err) => {console.error(err), this.sending.set(false), this.successful.set(false)}
    })
  }


  getAuthOptions = () => ({
    headers: {
      Authorization: `Token ${this.httpService.getToken()}`,  
    }
  })

  getLogo(){
    this.http.get(this.baseURL + `/auth/logo/`, this.getAuthOptions()).subscribe({
      next: (res) =>{
        this.userLogo.set((res as any).logo);
    
      },
      error: (err) => console.error(err)
    })
  }


  changePassword(data:any){
    this.sending.set(true)
    this.httpService.patch(this.baseURL + `/auth/change-password/`, data).subscribe({
      next: () => {this.sending.set(false), this.successful.set(true)},
      error: (err) => {
        if(err.error){
          this.successful.set(false)
          this.sending.set(false)
          this.errorMessage.set(err.error.detail[0])
        }
      }
    })
  }


  changeEmail(data:any){
    this.sending.set(true)
    this.httpService.patch(this.baseURL + `/auth/change-email/`, data).subscribe({
      next: () => {this.sending.set(false), this.successful.set(true),
        this.updateLocalStorageUserData({email: data.new_email})
      },
      error: (err) => {
        if(err.error){
          this.successful.set(false)
          this.errorMessage.set(err.error.detail[0])
        }
      }
    })
  }

  updateLocalStorageUserData({
    email,
    first_name,
    last_name
  }: { email?: string; first_name?: string; last_name?: string }) {
    const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
    const userStr = storage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    storage.setItem('user', JSON.stringify(user));
    this.userSignal.set(user);
  }

  changeAdress(data:any){
    this.sending.set(true)
    this.httpService.patch(this.baseURL + `/auth/change-address/`, data).subscribe({
      next: () => {this.sending.set(false), this.successful.set(true), this.updateLocalStorageUserData(data.first_name)},
      error: (err) => {
        if(err.error){
          this.errorMessage.set(err.error.detail[0])
        }
      }
    })
  }
}

  
