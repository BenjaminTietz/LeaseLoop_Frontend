import { Component, inject, OnInit, signal } from '@angular/core';
import { PromocodeService } from '../../services/promocode-service/promocode.service';
import { PromocodesFormComponent } from './promocodes-form/promocodes-form.component';
import { PromoCode } from '../../models/promocode.model';

@Component({
  selector: 'app-promocodes',
  standalone: true,
  imports: [PromocodesFormComponent],
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

  openEditForm(code: PromoCode) {
    console.log('Editing promocode:', code);
    this.pcs.selectedPromocode.set(code);
    this.formOpen.set(true);
    this.pcs.successful.set(false);
  }
}
