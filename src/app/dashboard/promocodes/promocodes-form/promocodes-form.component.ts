import {
  Component,
  effect,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
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
import { PromoDto } from '../../../models/promocode.model';
import { max } from 'rxjs';

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
      [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
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
    active: [this.promocodeService.selectedPromocode()?.active ?? true, Validators.required],
  });

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

  ngOnInit(): void {
    this.promocodeService.loadPromocodes();
  }

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

  closeForm = () => {
    this.close.emit();
    this.promocodeService.selectedPromocode.set(null);
  };

  createPromocode() {
    this.promocodeService.createPromocode(this.promocodeForm.value);
  }

  updatePromocode() {
    this.promocodeService.updatePromocode(this.promocodeForm.value);
  }
}
