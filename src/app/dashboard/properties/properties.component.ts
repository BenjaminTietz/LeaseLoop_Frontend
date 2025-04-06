import { Component, inject, OnInit } from '@angular/core';
import { PropertiesService } from '../../services/properties-service/properties.service';
@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  ps = inject(PropertiesService);

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties() {
    this.ps.loadProperties().subscribe({
      next: (data) => {
        this.ps.properties.set(data);
      },
      error: (error) => {
        console.error('Failed to load properties', error);
        // TODO: Handle error appropriately, e.g., show a notification to the user
      },
    });
  }
}
