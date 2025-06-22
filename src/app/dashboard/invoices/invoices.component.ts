import { Component, inject, OnInit, signal } from '@angular/core';
import { InvoiceService } from '../../services/invoice-service/invoice.service';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";
import { environment } from '../../../environments/environment';
import { FilterComponent } from "../../shared/global/filter/filter.component";

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, PagingComponent, SearchInputComponent, FilterComponent],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent implements OnInit {
  invoiceService = inject(InvoiceService);
  searchInput = signal('');
  BASE_URL = environment.mediaBaseUrl;

  filterBy = [
    { label: 'Name (A-Z)', value: 'ascending_name' },
    { label: 'Name (Z-A)', value: 'descending_name' },
    { label: 'Date (latest) ', value: 'ascending_date' },
    { label: 'Date (earliest)', value: 'descending_date' },
    { label: 'Booking ID (lowest)', value: 'booking_id_lowest' }, 
    { label: 'Booking ID (highest)', value: 'booking_id_highest' },
    { label: 'Amount (lowest)', value: 'amount_lowest' },
    { label: 'Amount (highest)', value: 'amount_highest' }
  ]

  ngOnInit(): void {
    this.invoiceService.getInvoices();
  }

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.invoiceService.getInvoices(1, searchTerm);
  }

  filterInvoices(filter:string){
    this.invoiceService.filterValue.set(filter);
    this.invoiceService.getInvoices(1, this.searchInput());
  }

  getMediaUrl(filePath: string): string {
  return `${this.BASE_URL}/${filePath}`.replace(/([^:]\/)\/+/g, '$1');
  }
}
