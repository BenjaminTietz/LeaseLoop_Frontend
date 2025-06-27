import { Component, inject, OnInit, signal } from '@angular/core';
import { PromocodeService } from '../../services/promocode-service/promocode.service';
import { PromocodesFormComponent } from './promocodes-form/promocodes-form.component';
import { PromoCode } from '../../models/promocode.model';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PagingComponent } from '../../shared/dashboard-components/paging/paging.component';
import { SearchInputComponent } from '../../shared/dashboard-components/search-input/search-input.component';
import { FilterComponent } from '../../shared/global/filter/filter.component';
import { HorizontalDirectivesDirective } from '../../directives/horizontal-scroll/horizontal-directives.directive';

@Component({
  selector: 'app-promocodes',
  standalone: true,
  imports: [
    PromocodesFormComponent,
    MatIcon,
    CommonModule,
    PagingComponent,
    SearchInputComponent,
    FilterComponent,
    HorizontalDirectivesDirective,
  ],
  templateUrl: './promocodes.component.html',
  styleUrl: './promocodes.component.scss',
})
export class PromocodesComponent implements OnInit {
  pcs = inject(PromocodeService);
  formOpen = signal<boolean>(false);
  searchInput = signal('');
  filterBy = [
    { label: 'Name (A-Z)', value: 'ascending_name' },
    { label: 'Name (Z-A)', value: 'descending_name' },
    { label: 'Code (A-Z)', value: 'ascending_code' },
    { label: 'Code (Z-A)', value: 'descending_code' },
    { label: 'Discount (low to high)', value: 'ascending_discount' },
    { label: 'Discount (high to low)', value: 'descending_discount' },
    { label: 'Valid until (latest)', value: 'latest' },
    { label: 'Valid until (earliest)', value: 'earliest' },
  ];

  /**
   * Angular lifecycle method that is called after the component's view has been fully initialized.
   * It initiates the loading of paginated promocodes.
   */

  ngOnInit(): void {
    this.loadPromocodes();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Updates the search input signal and reloads the promocodes table with the search term.
   * @param searchTerm The search term to filter the promocodes by.
   */
  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.pcs.loadPaginatedPromoCodes(1, searchTerm);
  }

  /**
   * Loads the first page of paginated promocodes without any search term.
   * This method utilizes the PromocodeService to fetch the data and update the component.
   */
  loadPromocodes() {
    this.pcs.loadPaginatedPromoCodes(1);
  }

  /**
   * Opens the promocode form for creating a new promocode.
   * Resets the selected promocode to null and sets the successful flag to false.
   */
  openForm() {
    this.formOpen.set(true);
    this.pcs.selectedPromocode.set(null);
    this.pcs.successful.set(false);
  }

  /**
   * Opens the promocode form for editing the given promocode.
   * Sets the selected promocode to the given value and sets the successful flag to false.
   * @param code The promocode to be edited.
   */
  openEditForm(code: PromoCode) {
    this.pcs.selectedPromocode.set(code);
    this.formOpen.set(true);
    this.pcs.successful.set(false);
  }

  /**
   * Closes the promocode form and reloads the promocodes table without any changes.
   * This method is called when the user clicks the close button in the form.
   */
  closeForm() {
    this.formOpen.set(false);
    this.pcs.loadPaginatedPromoCodes(
      this.pcs.currentPage(),
      this.searchInput()
    );
  }

  /**
   * Updates the filter signal and reloads the promocodes table with the search term and filter.
   * @param filter The filter to apply to the promocodes.
   */
  filterPromocodes(filter: string) {
    this.pcs.filterValue.set(filter);
    this.pcs.loadPaginatedPromoCodes(1, this.searchInput());
  }
}
