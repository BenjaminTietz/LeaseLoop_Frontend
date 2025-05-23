import { Component, inject, OnInit, signal } from '@angular/core';
import { UnitsService } from '../../services/units-service/units.service';
import { MatIcon } from '@angular/material/icon';
import { UnitFormComponent } from "./unit-form/unit-form.component";
import { CommonModule } from '@angular/common';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [MatIcon, UnitFormComponent, CommonModule, PagingComponent],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss',
})

export class UnitsComponent implements OnInit {
  unitsService = inject(UnitsService);
  formOpen = signal(false);

  ngOnInit(): void {
    this.unitsService.loadPaginatedUnits(1);
  }

  openForm() {
    this.formOpen.set(true);
    this.unitsService.selectedUnit.set(null);
    this.unitsService.successful.set(false);
  }

  openEditForm(unit:any) {
    this.formOpen.set(true);
    this.unitsService.successful.set(false);
    this.unitsService.selectedUnit.set(unit)
  }
}
