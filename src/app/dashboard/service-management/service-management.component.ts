import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';

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
  services = signal<ServiceModel[]>([]);
  private nextId = 3;

  ngOnInit(): void {
    this.services.set([
      { id: 1, name: 'Airport Transfer', price: 40, type: 'one_time' },
      { id: 2, name: 'Breakfast', price: 8, type: 'per_day' },
      { id: 1, name: 'Airport Transfer', price: 40, type: 'one_time' },
      { id: 2, name: 'Breakfast', price: 8, type: 'per_day' },
      { id: 1, name: 'Airport Transfer', price: 40, type: 'one_time' },
      { id: 2, name: 'Breakfast', price: 8, type: 'per_day' },
      { id: 1, name: 'Airport Transfer', price: 40, type: 'one_time' },
      { id: 2, name: 'Breakfast', price: 8, type: 'per_day' },
    ]);
  }

  openDialog() {
    console.log('Open dialog to add a new service');
  }
  deleteService() {
    console.log('Delete service');
  }
}
