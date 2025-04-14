import { Component, inject, OnInit } from '@angular/core';
import { InvoiceService } from '../../services/invoice-service/invoice.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss',
})
export class BillingComponent implements OnInit {
  invoiceServie = inject(InvoiceService);

  ngOnInit(): void {
    this.invoiceServie.getInvoices();
  }
}
