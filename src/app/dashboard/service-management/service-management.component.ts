import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ServiceManagementService } from '../../services/service-management/service-management.service';

interface ServiceModel {
  id: number;
  name: string;
  price: number;
  type: 'one_time' | 'per_day';
}

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss',
})
export class ServiceManagementComponent implements OnInit {
  sms = inject(ServiceManagementService);

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.sms.loadService().subscribe({
      next: (data) => {
        this.sms.services.set(data);
      },
      error: (error) => {
        console.error('Failed to load services', error);
        // TODO: Handle error appropriately, e.g., show a notification to the user
      },
    });
  }

  openDialog() {
    console.log('Open dialog to add a new service');
  }
  deleteService() {
    console.log('Delete service');
  }
}
