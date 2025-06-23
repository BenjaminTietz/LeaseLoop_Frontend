import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientsService } from '../../services/clients-service/clients.service';
import { ClientFormComponent } from './client-form/client-form.component';
import { Clients } from '../../models/clients.model';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PagingComponent } from '../../shared/dashboard-components/paging/paging.component';
import { SearchInputComponent } from '../../shared/dashboard-components/search-input/search-input.component';
import { FilterComponent } from '../../shared/global/filter/filter.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    ClientFormComponent,
    MatIcon,
    CommonModule,
    PagingComponent,
    SearchInputComponent,
    FilterComponent,
  ],
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
    { label: 'City (A-Z)', value: 'city' },
  ];

  /**
   * Loads the first page of clients on component initialization
   */
  ngOnInit(): void {
    this.clientService.loadPaginatedClients(1, '');
  }

  /**
   * Searches for clients based on the provided search term and loads the first page of results.
   *
   * @param searchTerm The term used to filter and search for clients.
   */

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.clientService.loadPaginatedClients(1, searchTerm);
  }

  /**
   * Opens the client form to create a new client.
   *
   * Resets the selected client and successful flags in the ClientsService.
   */

  openForm() {
    this.formOpen.set(true);
    this.clientService.selectedClient.set(null);
    this.clientService.successful.set(false);
  }

  /**
   * Opens the client form to edit the given client.
   *
   * Sets the selected client and successful flags in the ClientsService.
   *
   * @param client The client to edit.
   */
  openEditForm(client: Clients) {
    this.clientService.selectedClient.set(client);
    this.formOpen.set(true);
    this.clientService.successful.set(false);
  }

  /**
   * Closes the client form and loads the current page of paginated clients
   * based on the current search term.
   */
  closeForm() {
    this.formOpen.set(false);
    this.clientService.loadPaginatedClients(
      this.clientService.currentPage(),
      this.searchInput()
    );
  }

  /**
   * Filters the clients based on the provided filter criteria.
   *
   * The method updates the filter value and reloads the first page of
   * paginated clients using the current search term.
   *
   * @param filter The filter criteria to apply.
   */
  filterClients(filter: string) {
    this.clientService.filterValue.set(filter);
    this.clientService.loadPaginatedClients(1, this.searchInput());
  }
}
