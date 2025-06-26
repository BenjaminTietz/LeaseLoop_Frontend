import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ServiceManagementService } from '../../services/service-management/service-management.service';
import { ServiceFormComponent } from './service-form/service-form.component';
import { HttpService } from '../../services/httpclient/http.service';
import { environment } from '../../../environments/environment';
import { Service, ServiceDto } from '../../models/service.model';
import { MatIcon } from '@angular/material/icon';
import { PagingComponent } from '../../shared/dashboard-components/paging/paging.component';
import { SearchInputComponent } from '../../shared/dashboard-components/search-input/search-input.component';
import { FilterComponent } from '../../shared/global/filter/filter.component';
import { HorizontalDirectivesDirective } from '../../directives/horizontal-scroll/horizontal-directives.directive';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [
    CommonModule,
    ServiceFormComponent,
    CommonModule,
    MatIcon,
    PagingComponent,
    SearchInputComponent,
    FilterComponent,
    HorizontalDirectivesDirective
  ],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss',
})
export class ServiceManagementComponent implements OnInit {
  sms = inject(ServiceManagementService);
  sending = signal<boolean>(false);
  successful = signal<boolean>(false);
  httpService = inject(HttpService);
  http = inject(HttpService);
  formOpen = signal<boolean>(false);
  searchInput = signal('');
  filterBy = [
    { label: 'Name (A-Z)', value: 'ascending_name' },
    { label: 'Name (Z-A)', value: 'descending_name' },
    { label: 'Price (low to high)', value: 'ascending_price' },
    { label: 'Price (high to low)', value: 'descending_price' },
    { label: 'One-time', value: 'one_time' },
    { label: 'Per day', value: 'per_day' },
    { label: 'Property name (A-Z)', value: 'ascending_property_name' },
    { label: 'Property name (Z-A)', value: 'descending_property_name' },
  ];

  /**
   * Initializes the component by loading the services from the server.
   *
   * This is a lifecycle hook that is called automatically by Angular when the component is created.
   */
  ngOnInit(): void {
    this.loadServices();
  }

  /**
   * Opens the service form with the given service data pre-filled.
   *
   * This function sets the reactive state of the selected service and the form open state.
   * @param service The service to be edited.
   */
  openEditForm(service: Service) {
    this.sms.selectedService.set(service);
    this.formOpen.set(true);
    this.sms.successful.set(false);
  }

  /**
   * Searches for services based on the given search term.
   *
   * The search term is saved to the search input signal and the first page of services
   * is reloaded from the server with the given search term.
   * @param searchTerm The search term to search for.
   */
  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.sms.loadPaginatedService(1, searchTerm);
  }

  /**
   * Opens the service form for creating a new service.
   *
   * Sets the formOpen state to true, clears the selected service,
   * and resets the successful flag to false.
   */
  openForm() {
    this.formOpen.set(true);
    this.sms.selectedService.set(null);
    this.sms.successful.set(false);
  }

  /**
   * Loads the first page of paginated services from the server.
   *
   * This method calls the service management service to retrieve
   * and display the list of services, starting from the first page.
   */

  loadServices() {
    this.sms.loadPaginatedService(1);
  }

  /**
   * Creates a new service with the given data.
   *
   * This function sends a POST request to the server to create the specified
   * service. It updates the local services list by reloading the first page of
   * services from the server. It also manages the UI state by setting the sending
   * and successful signals.
   *
   * @param serviceData - The data to be used to create the new service.
   */
  createService(serviceData: ServiceDto) {
    this.sending.set(true);
    this.http
      .post<Service>(`${environment.apiBaseUrl}/api/services/`, serviceData)
      .subscribe({
        next: () => {
          this.loadServices();
          this.sending.set(false);
          this.successful.set(true);
        },
        error: (err) => {
          this.sending.set(false);
          this.successful.set(false);
          console.error(err);
        },
      });
  }

  /**
   * Closes the service form and reloads the current page of paginated services
   * based on the current search term.
   */
  closeForm() {
    this.formOpen.set(false);
    this.sms.loadPaginatedService(this.sms.currentPage(), this.searchInput());
  }

  /**
   * Filters the services based on the provided filter criteria.
   *
   * This function sets the filter value and reloads the first page of
   * paginated services using the current search term.
   *
   * @param filter The filter criteria to apply.
   */
  filterServices(filter: string) {
    this.sms.filterValue.set(filter);
    this.sms.loadPaginatedService(1, this.searchInput());
  }
}
