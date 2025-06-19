import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class FormService {

  phonePattern= '^^\\+?\\d(?:[\\d ]{9,34})$';
  emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$';
  passwordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d])[^\\s]{8,}$';
  namePattern = '^[A-Za-z]+(-[A-Za-z]+)?$';
  pricePattern = '^[0-9]*[.,]?[0-9]{0,2}$';
  promocodePattern = '^[A-Za-z0-9]{1,10}$';

  constructor() { }

  markAllAsTouched(form: AbstractControl) {
    if (form instanceof FormGroup) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
        this.markAllAsTouched(control);
      });
    } else {
      form.markAsTouched();
    }
  }

  unmarkAllAsTouched(form: AbstractControl) {
    if (form instanceof FormGroup) {
      Object.values(form.controls).forEach(control => {
        control.markAsUntouched();
        this.unmarkAllAsTouched(control);
      });
    } else {
      form.markAsUntouched();
    }
  }

  getFormErrors(form: FormGroup, controlName: string) {
    const control = form.controls[controlName];
    return control?.touched && control?.invalid ? control.errors : null;
  }

  resetForm(form: FormGroup) {
    form.reset();
    this.unmarkAllAsTouched(form);
  }
}
