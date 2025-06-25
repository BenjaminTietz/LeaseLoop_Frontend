import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export class FormService {
  phonePattern = '^^\\+?\\d(?:[\\d ]{9,34})$';
  emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$';
  passwordPattern =
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d])[^\\s]{8,}$';
  namePattern = '^[A-Za-z]+(-[A-Za-z]+)?$';
  pricePattern = '^[0-9]*[.,]?[0-9]{0,2}$';
  promocodePattern = '^[A-Za-z0-9]{1,10}$';

  constructor() {}

  /**
   * Recursively marks all form controls as touched, including nested form groups.
   * This is useful for displaying validation errors on the entire form.
   * @param form The form or form control to mark as touched.
   */
  markAllAsTouched(form: AbstractControl) {
    if (form instanceof FormGroup) {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
        this.markAllAsTouched(control);
      });
    } else {
      form.markAsTouched();
    }
  }

  /**
   * Recursively marks all form controls as untouched, including nested form groups.
   * This is useful for clearing validation errors on the entire form.
   * @param form The form or form control to mark as untouched.
   */
  unmarkAllAsTouched(form: AbstractControl) {
    if (form instanceof FormGroup) {
      Object.values(form.controls).forEach((control) => {
        control.markAsUntouched();
        this.unmarkAllAsTouched(control);
      });
    } else {
      form.markAsUntouched();
    }
  }

  /**
   * Gets the validation errors for a form control, only if the control has been touched and is invalid.
   * @param form The form containing the control.
   * @param controlName The name of the control.
   * @returns The validation errors, or null if the control is not touched or is valid.
   */
  getFormErrors(form: FormGroup, controlName: string) {
    const control = form.controls[controlName];
    return control?.touched && control?.invalid ? control.errors : null;
  }

  /**
   * Resets a form to its pristine state, and removes all validation errors.
   * @param form The form to reset.
   */
  resetForm(form: FormGroup) {
    form.reset();
    this.unmarkAllAsTouched(form);
  }
}
