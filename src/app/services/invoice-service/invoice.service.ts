import { inject, Injectable, signal } from '@angular/core';
import { HttpService } from '../httpclient/http.service';
import { Invoice } from '../../models/invoice.model';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  httpService = inject(HttpService);
  invoiceStats = signal<Invoice[] | null>(null);

  ngOnInit(): void {
    this.getInvoices();
  }

  getInvoices() {
    this.httpService
      .get<Invoice>(`${environment.apiBaseUrl}/api/invoices/owner/`)
      .subscribe({
        next: (data) => this.invoiceStats.set([data] as Invoice[]),
        error: (error) => console.error('Failed to load invoices', error),
      });
    console.log('InvoiceStats', this.invoiceStats());
  }
}
