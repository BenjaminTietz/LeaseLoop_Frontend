import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ServiceManagementService } from '../../services/service-management/service-management.service';
import { ServiceFormComponent } from './service-form/service-form.component';
import { HttpService } from '../../services/httpclient/http.service';
import { environment } from '../../../environments/environment';
import { Service, ServiceDto } from '../../models/service.model';
import { MatIcon } from '@angular/material/icon';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, ServiceFormComponent, CommonModule, MatIcon, PagingComponent, SearchInputComponent],
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

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.sms.loadPaginatedService(1, searchTerm);
  }

  openForm(){
    this.formOpen.set(true);
    this.sms.selectedService.set(null);
    this.sms.successful.set(false);
  }

  loadServices() {
    this.sms.loadPaginatedService(1);
  }

  // TODO: Ask Team about using AuthInterceptor for token management
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

  closeForm(){
    this.formOpen.set(false);
    this.sms.loadPaginatedService(this.sms.currentPage(), this.searchInput());
  }
}
