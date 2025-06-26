import { Component, inject, OnInit, signal } from '@angular/core';
import { UnitsService } from '../../services/units-service/units.service';
import { MatIcon } from '@angular/material/icon';
import { UnitFormComponent } from './unit-form/unit-form.component';
import { CommonModule } from '@angular/common';
import { PagingComponent } from '../../shared/dashboard-components/paging/paging.component';
import { SearchInputComponent } from '../../shared/dashboard-components/search-input/search-input.component';
import { AmenitiesService } from '../../services/amenities-service/amenities.service';
import { FilterComponent } from '../../shared/global/filter/filter.component';
import { HorizontalDirectivesDirective } from '../../directives/horizontal-scroll/horizontal-directives.directive';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    MatIcon,
    UnitFormComponent,
    CommonModule,
    PagingComponent,
    SearchInputComponent,
    FilterComponent,
    HorizontalDirectivesDirective
  ],
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
    { label: 'Price (low to high)', value: 'price_per_night' },
    { label: 'Price (high to low)', value: 'descending_price_per_night' },
  ];

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   *
   * Loads the first page of paginated units when the component is initialized.
   */

  ngOnInit(): void {
    this.unitsService.loadPaginatedUnits(1);
  }

  /**
   * Searches for units based on the search term, and loads the first page of results.
   * @param searchTerm The search term to search for.
   */
  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.unitsService.loadPaginatedUnits(1, searchTerm);
  }

  /**
   * Opens the unit form for creating a new unit.
   *
   * This method sets the formOpen signal to true,
   * clears the currently selected unit, and resets
   * the successful flag to false.
   */
  openForm() {
    this.formOpen.set(true);
    this.unitsService.selectedUnit.set(null);
    this.unitsService.successful.set(false);
  }

  /**
   * Opens the unit form for editing the given unit.
   * Sets the selected unit to the given unit, sets the formOpen signal to true, and resets the successful flag to false.
   * @param unit The unit to edit.
   */
  openEditForm(unit: any) {
    this.formOpen.set(true);
    this.unitsService.successful.set(false);
    this.unitsService.selectedUnit.set(unit);
  }

  /**
   * Closes the unit form and reloads the current page of paginated units
   * based on the current search term.
   */
  closeForm() {
    this.formOpen.set(false);
    this.unitsService.loadPaginatedUnits(
      this.unitsService.currentPage(),
      this.searchInput()
    );
  }

  /**
   * Filters the units based on the given filter value, and loads the first page of the filtered units.
   * @param filter The filter value to filter the units by.
   */
  filterUnits(filter: string) {
    this.unitsService.filterValue.set(filter);
    this.unitsService.loadPaginatedUnits(1, this.searchInput());
  }
}
