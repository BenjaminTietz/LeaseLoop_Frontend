import { Component, inject, OnInit, signal } from '@angular/core';
import { PromocodeService } from '../../services/promocode-service/promocode.service';
import { PromocodesFormComponent } from './promocodes-form/promocodes-form.component';
import { PromoCode } from '../../models/promocode.model';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";

@Component({
  selector: 'app-promocodes',
  standalone: true,
  imports: [PromocodesFormComponent, MatIcon, CommonModule, PagingComponent, SearchInputComponent],
  templateUrl: './promocodes.component.html',
  styleUrl: './promocodes.component.scss',
})
export class PromocodesComponent implements OnInit {
  pcs = inject(PromocodeService);
  formOpen = signal<boolean>(false);
  searchInput = signal('');

  ngOnInit(): void {
    this.loadPromocodes();
  }

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.pcs.loadPaginatedPromoCodes(1, searchTerm);
  }

  loadPromocodes() {
    this.pcs.loadPaginatedPromoCodes(1);
  }

  openForm() {
    this.formOpen.set(true);
    this.pcs.selectedPromocode.set(null);
    this.pcs.successful.set(false);
  }

  openEditForm(code: PromoCode) {
    this.pcs.selectedPromocode.set(code);
    this.formOpen.set(true);
    this.pcs.successful.set(false);
  }

  closeForm() {
    this.formOpen.set(false);
    this.pcs.loadPaginatedPromoCodes(this.pcs.currentPage(), this.searchInput());
  }
}
