import { Component, inject, OnInit, signal } from '@angular/core';
import { PropertiesService } from '../../services/properties-service/properties.service';
import { PropertyFormComponent } from './property-form/property-form.component';
import { MatIcon } from '@angular/material/icon';
import { ProgressBarComponent } from '../../shared/global/progress-bar/progress-bar.component';
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property.model';
import { PagingComponent } from '../../shared/dashboard-components/paging/paging.component';
import { SearchInputComponent } from '../../shared/dashboard-components/search-input/search-input.component';
import { FilterComponent } from '../../shared/global/filter/filter.component';
import { HorizontalDirectivesDirective } from '../../directives/horizontal-scroll/horizontal-directives.directive';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    PropertyFormComponent,
    MatIcon,
    ProgressBarComponent,
    CommonModule,
    PagingComponent,
    SearchInputComponent,
    FilterComponent,
    HorizontalDirectivesDirective
  ],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  propertyService = inject(PropertiesService);
  formOpen = signal(false);
  searchInput = signal('');
  filterBy = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Most Units', value: 'most_units' },
    { label: 'Most Images', value: 'most_images' },
    { label: 'Name (A-Z)', value: 'ascending_name' },
    { label: 'Name (Z-A)', value: 'descending_name' },
    { label: 'Country (A-Z)', value: 'country' },
    { label: 'City (A-Z)', value: 'city' },
  ];

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It triggers the loading of the first page of paginated properties from the server.
   */
  ngOnInit(): void {
    this.propertyService.loadPaginatedProperties(1);
  }

  /**
   * Searches for properties based on the given search term.
   * @param searchTerm The search term to search for.
   */
  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.propertyService.loadPaginatedProperties(1, searchTerm);
  }

  /**
   * Opens the property form without selecting a property to edit.
   * Sets the selected property to null and sets the successful flag to false.
   */
  openForm() {
    this.formOpen.set(true);
    this.propertyService.selectedProperty.set(null);
    this.propertyService.successful.set(false);
  }

  /**
   * Opens the property form in edit mode for the given property.
   * Sets the selected property to the given property and sets the successful flag to false.
   * @param property The property to edit.
   */
  openEditForm(property: Property) {
    this.formOpen.set(true);
    this.propertyService.successful.set(false);
    this.propertyService.selectedProperty.set(property);
  }

  /**
   * Closes the property form.
   * Sets the formOpen signal to false and reloads the current page of properties from the server.
   */
  closeForm() {
    this.formOpen.set(false);
    this.propertyService.loadPaginatedProperties(
      this.propertyService.currentPage(),
      this.searchInput()
    );
  }

  /**
   * Filters the properties based on the given filter criteria.
   * Sets the filter value and reloads the first page of properties from the server.
   * @param filter The filter criteria to apply.
   */
  filterProperties(filter: string) {
    this.propertyService.filterValue.set(filter);
    this.propertyService.loadPaginatedProperties(1, this.searchInput());
  }
}
