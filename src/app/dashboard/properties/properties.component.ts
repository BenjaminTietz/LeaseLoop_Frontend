import { Component, inject, OnInit, signal } from '@angular/core';
import { DatabaseService } from '../../services/database-service/database.service';
import { PropertyFormComponent } from "./property-form/property-form.component";
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [PropertyFormComponent, MatIcon],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  dbService = inject(DatabaseService);
  formOpen = signal(false);

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties() {
    this.dbService.loadProperties().subscribe({
      next: (data) => {
        this.dbService.properties.set(data);
      },
      error: (error) => {
        console.error('Failed to load properties', error);
        // TODO: Handle error appropriately, e.g., show a notification to the user
      },
    });
  }
}
