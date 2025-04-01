import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loginData = signal({});


  constructor() { }

  loginUser(){
    console.log(this.loginData());
    
  }
  

  


}
