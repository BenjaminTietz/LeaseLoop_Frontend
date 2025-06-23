import { Component, effect, EventEmitter, inject, Output } from '@angular/core';
import { FormService } from '../../../services/form-service/form.service';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { ProgressBarComponent } from '../../../shared/global/progress-bar/progress-bar.component';
import { MatIcon } from '@angular/material/icon';
import { PromocodeService } from '../../../services/promocode-service/promocode.service';

@Component({
  selector: 'app-promocodes-form',
  standalone: true,
  imports: [
    ClickOutsideDirective,
    ProgressBarComponent,
    MatIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './promocodes-form.component.html',
  styleUrl: './promocodes-form.component.scss',
})
export class PromocodesFormComponent {
  promocodeService = inject(PromocodeService);
  formService = inject(FormService);
  @Output() close = new EventEmitter();
  today: string = new Date().toISOString().split('T')[0];
  promocodeForm = new FormBuilder().nonNullable.group({
    code: [
      this.promocodeService.selectedPromocode()?.code || '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern(this.formService.promocodePattern),
      ],
    ],
    description: [
      this.promocodeService.selectedPromocode()?.description || '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(50)],
    ],
    valid_until: [this.today, Validators.required],
    discount_percent: [
      this.promocodeService.selectedPromocode()?.discount_percent || 0,
      [Validators.required, this.integerValidator],
    ],
    active: [
      this.promocodeService.selectedPromocode()?.active ?? true,
      Validators.required,
    ],
  });

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Initializes the component by loading the list of promocodes from the PromocodeService.
   */
  ngOnInit(): void {
    this.promocodeService.loadPromocodes();
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized a component.
   * Subscribes to the PromocodeService's successful signal and resets the form and closes it
   * if the signal is true.
   * The effect's allowSignalWrites option is set to true to ensure that the side effects are
   * executed even if the signal is already true when the effect is created.
   */
  constructor() {
    effect(
      () => {
        if (this.promocodeService.successful()) {
          this.formService.resetForm(this.promocodeForm);
          this.closeForm();
        }
      },
      { allowSignalWrites: true }
    );
  }

  /**
   * Validator for the discount percent input.
   * Returns null if the input is valid, otherwise an object with one of the following properties:
   * - notInteger: true if the input is not an integer
   * - outOfRange: true if the input is not between 0 and 100 (inclusive)
   * @param control The form control to validate
   * @returns An object with the validation error(s) or null if the input is valid
   */
  integerValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (!Number.isInteger(value)) {
      return { notInteger: true };
    }
    if (value < 0 || value > 100) {
      return { outOfRange: true };
    }
    return null;
  }

  closeForm = () => {
    this.close.emit();
    this.promocodeService.selectedPromocode.set(null);
  };

  /**
   * Creates a new promo code using the data from the form.
   * Calls the PromocodeService's createPromocode method with the form values.
   * Assumes that the form has been validated before calling this method.
   */
  createPromocode() {
    this.promocodeService.createPromocode(this.promocodeForm.value);
  }

  /**
   * Updates an existing promo code using the data from the form.
   * Calls the PromocodeService's updatePromocode method with the form values.
   * Assumes that the form has been validated before calling this method.
   */
  updatePromocode() {
    this.promocodeService.updatePromocode(this.promocodeForm.value);
  }
}
