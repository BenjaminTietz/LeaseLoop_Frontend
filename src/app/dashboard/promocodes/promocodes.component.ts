import { Component, inject, OnInit, signal } from '@angular/core';
import { PromocodeService } from '../../services/promocode-service/promocode.service';
import { PromocodesFormComponent } from './promocodes-form/promocodes-form.component';
import { PromoCode } from '../../models/promocode.model';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promocodes',
  standalone: true,
  imports: [PromocodesFormComponent, MatIcon, CommonModule],
  templateUrl: './promocodes.component.html',
  styleUrl: './promocodes.component.scss',
})
export class PromocodesComponent implements OnInit {
  pcs = inject(PromocodeService);
  formOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadPromocodes();
  }

  loadPromocodes() {
    this.pcs.loadPromocodes();
  }

  openForm() {
    this.formOpen.set(true);
    this.pcs.selectedPromocode.set(null);
    this.pcs.successful.set(false);
  }

  openEditForm(code: PromoCode) {
    console.log('openEditForm', code);
    this.pcs.selectedPromocode.set(code);
    this.formOpen.set(true);
    this.pcs.successful.set(false);
  }
}
