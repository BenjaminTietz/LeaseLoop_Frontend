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
  userId = computed(() => {
    const userStr = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.id ?? null;
  });

  logoPath = computed(() => {
    return this.mediaUrl + this.userLogo();
  })


  changeImage(file:File){
    this.sending.set(true)
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('user', this.userId());
    this.http.patch(this.baseURL + `/auth/logo/`, formData, this.getAuthOptions()).subscribe({
      next: () => {this.getLogo(), this.sending.set(false), this.successful.set(true)},
      error: (err) => console.error(err)
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
          this.errorMessage.set(err.error.detail[0])
        }
      }
    })
  }

  
}
