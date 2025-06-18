import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Invoice } from '../../models/invoice.model';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/paginated-response.model';
@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  httpService = inject(HttpService);
  invoiceStats = signal<Invoice[] | null>(null);
  sending = signal<boolean>(false);
  totalPages = signal(1);
  currentPage = signal(1);
  filterValue = signal('');
  

  constructor() {
    this.getInvoices();
  }

  getInvoices(page: number = 1, searchTerm: string = '') {
    this.sending.set(true);
    this.httpService
      .get<PaginatedResponse<Invoice>>(
        `${environment.apiBaseUrl}/api/invoices/owner/?page=${page}&search=${searchTerm}&filter=${this.filterValue()}`
      )
      .subscribe({
        next: (data) => {
          this.invoiceStats.set(data.results);
          this.sending.set(false);
          this.totalPages.set(data.total_pages);
          this.currentPage.set(page);
          console.log(this.invoiceStats());
        },
        error: (error) => {
          console.error('Failed to load invoices', error);
        },
      });
  }
}
