import { Component, inject, OnInit, signal } from '@angular/core';
import { InvoiceService } from '../../services/invoice-service/invoice.service';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';
import { PagingComponent } from '../../shared/dashboard-components/paging/paging.component';
import { SearchInputComponent } from '../../shared/dashboard-components/search-input/search-input.component';
import { FilterComponent } from '../../shared/global/filter/filter.component';
import { getMediaUrl } from '../../utils/media-path.utils';
import { HorizontalDirectivesDirective } from '../../directives/horizontal-scroll/horizontal-directives.directive';


@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarComponent,
    PagingComponent,
    SearchInputComponent,
    FilterComponent,
    HorizontalDirectivesDirective
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent implements OnInit {
  invoiceService = inject(InvoiceService);
  searchInput = signal('');
  getMediaUrl = getMediaUrl;

  filterBy = [
    { label: 'Name (A-Z)', value: 'ascending_name' },
    { label: 'Name (Z-A)', value: 'descending_name' },
    { label: 'Date (latest) ', value: 'ascending_date' },
    { label: 'Date (earliest)', value: 'descending_date' },
    { label: 'Booking ID (lowest)', value: 'booking_id_lowest' },
    { label: 'Booking ID (highest)', value: 'booking_id_highest' },
    { label: 'Amount (lowest)', value: 'amount_lowest' },
    { label: 'Amount (highest)', value: 'amount_highest' },
  ];

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It triggers the loading of the invoices from the server.
   */
  ngOnInit(): void {
    this.invoiceService.getInvoices();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Searches for invoices based on the given search term.
   * @param searchTerm The search term to search for.
   */
  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.invoiceService.getInvoices(1, searchTerm);
  }

  /**
   * Filters the invoices based on the provided filter criteria.
   * @param filter The filter criteria to apply.
   */
  filterInvoices(filter: string) {
    this.invoiceService.filterValue.set(filter);
    this.invoiceService.getInvoices(1, this.searchInput());
  }

}
