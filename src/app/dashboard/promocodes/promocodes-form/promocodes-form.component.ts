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
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
    ],
    description: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(50)],
    ],
    valid_until: [this.today, Validators.required],
    discount_percent: [
      null as number | null,
      [Validators.required, this.integerValidator],
    ],
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
    effect(() => {
      const selected = this.promocodeService.selectedPromocode();
      if (selected !== null) {
        this.promocodeForm.patchValue({
          code: selected.code,
          description: selected.description,
          valid_until: selected.valid_until,
          discount_percent: selected.discount_percent,
        });
      }
    });

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
    console.log('createPromocode', this.promocodeForm.value);
    const promocode = this.promocodeForm.value;
    const promocodeData: PromoDto = {
      code: promocode.code,
      description: promocode.description,
      valid_until: new Date(promocode.valid_until ?? this.today)
        .toISOString()
        .split('T')[0],
      discount_percent: promocode.discount_percent! ?? 0,
    };

    this.promocodeService.createPromocode(promocodeData);
  }

  updatePromocode() {
    console.log('updatePromocode');
    const raw = this.promocodeForm.value;
    const promocodeData: PromoDto = {
      code: raw.code,
      description: raw.description,
      valid_until: new Date(raw.valid_until ?? this.today)
        .toISOString()
        .split('T')[0],
      discount_percent: raw.discount_percent! ?? 0,
    };

    this.promocodeService.updatePromocode(promocodeData);
  }
}
