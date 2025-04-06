import { Component, inject, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database-service/database.service';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  dbService = inject(DatabaseService);

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
