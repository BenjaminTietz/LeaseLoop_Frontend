import { Component, inject, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database-service/database.service';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss',
})
export class UnitsComponent implements OnInit {
  dbService = inject(DatabaseService);

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits() {
    this.dbService.loadUnits().subscribe({
      next: (data) => {
        this.dbService.units.set(data);
      },
      error: (error) => {
        console.error('Failed to load units', error);
        // TODO: Handle error appropriately, e.g., show a notification to the user
      },
    });
  }
}
