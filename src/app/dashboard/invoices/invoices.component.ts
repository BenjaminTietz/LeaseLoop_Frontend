import { Component, inject, OnInit } from '@angular/core';
import { InvoiceService } from '../../services/invoice-service/invoice.service';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent implements OnInit {
  invoiceService = inject(InvoiceService);

  ngOnInit(): void {
    this.invoiceService.getInvoices();
  }
}
