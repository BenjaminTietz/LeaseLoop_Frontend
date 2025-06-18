import { Component, inject, OnInit, signal } from '@angular/core';
import { UnitsService } from '../../services/units-service/units.service';
import { MatIcon } from '@angular/material/icon';
import { UnitFormComponent } from "./unit-form/unit-form.component";
import { CommonModule } from '@angular/common';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";
import { AmenitiesService } from '../../services/amenities-service/amenities.service';
import { FilterComponent } from "../../shared/global/filter/filter.component";

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [MatIcon, UnitFormComponent, CommonModule, PagingComponent, SearchInputComponent, FilterComponent],
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss',
})

export class UnitsComponent implements OnInit {
  unitsService = inject(UnitsService);
  amenitiesService = inject(AmenitiesService);
  formOpen = signal(false);
  searchInput = signal('');
  filterBy = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Capacity', value: 'capacity' },
    { label: 'Name (A-Z)', value: 'ascending_name' },
    { label: 'Name (Z-A)', value: 'descending_name' },
    { label: 'Status', value: 'status' },
    { label: 'Price (low to high)', value: 'price_per_night'},
    { label: 'Price (high to low)', value: 'descending_price_per_night'},
  ]

  ngOnInit(): void {
    this.unitsService.loadPaginatedUnits(1);
  }

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.unitsService.loadPaginatedUnits(1, searchTerm);
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

  closeForm() {
    this.formOpen.set(false);
    this.unitsService.loadPaginatedUnits(this.unitsService.currentPage(), this.searchInput());
  }

  filterUnits(filter: string) {
    this.unitsService.filterValue.set(filter)
    this.unitsService.loadPaginatedUnits(1, this.searchInput());
  }
}
