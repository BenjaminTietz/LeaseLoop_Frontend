import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { PropertiesService } from '../../services/properties-service/properties.service';
import { PropertyFormComponent } from "./property-form/property-form.component";
import { MatIcon } from '@angular/material/icon';
import { ProgressBarComponent } from "../../shared/global/progress-bar/progress-bar.component";
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property.model';
import { PagingComponent } from "../../shared/dashboard-components/paging/paging.component";
@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [PropertyFormComponent, MatIcon, ProgressBarComponent, CommonModule, PagingComponent],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.scss',
})
export class PropertiesComponent implements OnInit {
  propertyService = inject(PropertiesService); 
  formOpen = signal(false);

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
}
