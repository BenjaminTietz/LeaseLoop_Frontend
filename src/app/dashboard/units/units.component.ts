import { Component, inject, OnInit, signal } from '@angular/core';
import { UnitsService } from '../../services/units-service/units.service';
import { MatIcon } from '@angular/material/icon';
import { UnitFormComponent } from "./unit-form/unit-form.component";

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [MatIcon, UnitFormComponent],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss',
})

export class UnitsComponent implements OnInit {
  unitsService = inject(UnitsService);
  formOpen = signal(false);

  ngOnInit(): void {
    this.unitsService.loadUnits();
  }

  openForm() {
    this.formOpen.set(true);
  }

  openEditForm() {
    this.formOpen.set(true);
  }
}
