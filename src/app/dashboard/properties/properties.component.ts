import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { PropertiesService } from '../../services/properties-service/properties.service';
import { PropertyFormComponent } from "./property-form/property-form.component";
import { MatIcon } from '@angular/material/icon';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property.model';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
import { SearchInputComponent } from "../../shared/dashboard-components/search-input/search-input.component";
import { FilterComponent } from "../../shared/global/filter/filter.component";
@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [PropertyFormComponent, MatIcon, ProgressBarComponent, CommonModule, PagingComponent, SearchInputComponent, FilterComponent],
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
  { label: 'City (A-Z)', value: 'city' }
  ];
  

  search(searchTerm: string) {
    this.searchInput.set(searchTerm);
    this.propertyService.loadPaginatedProperties(1, searchTerm);
  }
  openForm() {
    this.formOpen.set(true);
    this.propertyService.selectedProperty.set(null);
    this.propertyService.successful.set(false);
  }

  ngOnInit(): void {
    this.propertyService.loadPaginatedProperties(1);
  }

  openEditForm(property : Property) {
    this.formOpen.set(true);
    this.propertyService.successful.set(false);
    this.propertyService.selectedProperty.set(property);
  }

  closeForm() {
    this.formOpen.set(false);
    this.propertyService.loadPaginatedProperties(this.propertyService.currentPage(), this.searchInput());
  }

  filterProperties(filter: string) {
    this.propertyService.filterValue.set(filter);
    this.propertyService.loadPaginatedProperties(1, this.searchInput());

  }
}
