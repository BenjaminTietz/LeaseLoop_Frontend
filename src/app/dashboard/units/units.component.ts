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
    this.us.loadUnits();
  }
}
