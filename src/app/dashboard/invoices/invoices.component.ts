import { Component, inject, OnInit, signal } from '@angular/core';
import { InvoiceService } from '../../services/invoice-service/invoice.service';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, PagingComponent, SearchInputComponent],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent implements OnInit {
  invoiceService = inject(InvoiceService);
  searchInput = signal('');

  ngOnInit(): void {
    this.invoiceService.getInvoices();
  }

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.invoiceService.getInvoices(1, searchTerm);
  }
}
