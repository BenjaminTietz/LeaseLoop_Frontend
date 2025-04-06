import { Component, inject, OnInit } from '@angular/core';
import { UnitsService } from '../../services/units-service/units.service';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss',
})
export class UnitsComponent implements OnInit {
  us = inject(UnitsService);

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits() {
    this.us.loadUnits().subscribe({
      next: (data) => {
        this.us.units.set(data);
      },
      error: (error) => {
        console.error('Failed to load units', error);
        // TODO: Handle error appropriately, e.g., show a notification to the user
      },
    });
  }
}
