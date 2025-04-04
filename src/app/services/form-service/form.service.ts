import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class FormService {

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
