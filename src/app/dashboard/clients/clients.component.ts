import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientsService } from '../../services/clients-service/clients.service';
import { ClientFormComponent } from './client-form/client-form.component';
import { Clients } from '../../models/clients.model';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";
import { FilterComponent } from "../../shared/global/filter/filter.component";

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ClientFormComponent, MatIcon, CommonModule, PagingComponent, SearchInputComponent, FilterComponent],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  clientService = inject(ClientsService);
  formOpen = signal(false);
  searchInput = signal('');

  filterBy = [
    { label: 'Name (A-Z)', value: 'ascending_name' },
    { label: 'Name (Z-A)', value: 'descending_name' },
    { label: 'Email (A-Z)', value: 'ascending_email' },
    { label: 'Email (Z-A)', value: 'descending_email' },
    { label: 'Country (A-Z)', value: 'country' },
    { label: 'City (A-Z)', value: 'city' }
  ]

  ngOnInit(): void {
    this.clientService.loadPaginatedClients(1, '');
  }

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.clientService.loadPaginatedClients(1, searchTerm);
  }

  openForm() {
    this.formOpen.set(true);
    this.clientService.selectedClient.set(null);
    this.clientService.successful.set(false);
  }

  openEditForm(client: Clients) {
    this.clientService.selectedClient.set(client);
    this.formOpen.set(true);
    this.clientService.successful.set(false);
  }

  closeForm() {
    this.formOpen.set(false);
    this.clientService.loadPaginatedClients(this.clientService.currentPage(), this.searchInput());
  }

  filterClients(filter: string) {
    this.clientService.filterValue.set(filter);
    this.clientService.loadPaginatedClients(1, this.searchInput());
  }
}
