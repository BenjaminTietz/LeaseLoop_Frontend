import { Component, effect, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { ClickOutsideDirective } from '../../../directives/outside-click/click-outside.directive';
import { MatIcon } from '@angular/material/icon';
import { ProgressBarComponent } from "../../../shared/global/progress-bar/progress-bar.component";
import { UnitsService } from '../../../services/units-service/units.service';
import { FormService } from '../../../services/form-service/form.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageUploadComponent } from "../../../shared/dashboard-components/image-upload/image-upload.component";
import { PropertiesService } from '../../../services/properties-service/properties.service';
import { PropertyShort } from '../../../models/service.model';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../../utils/scroll.utils';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [ClickOutsideDirective, MatIcon, ProgressBarComponent, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.scss'
})
export class UnitFormComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter();
  unitService = inject(UnitsService)
  formService = inject(FormService)
  propertyService = inject(PropertiesService)
  images: any
  newImageDescriptions!: string[]
  imagePreviews!: any[]
  missingDescription: boolean = false

  unitForm = new FormBuilder().nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    capacity: [0, Validators.required],
    max_capacity: [0, Validators.required],
    price_per_night: [0, Validators.required],
    price_per_extra_person: [0, Validators.required],
    property: [null as PropertyShort | null, Validators.required]  // <- allow null
  });

  constructor() {
    effect(() => {
      if (this.unitService.successful()) {
        this.formService.resetForm(this.unitForm);
        this.closeForm();
      }
    }, { allowSignalWrites: true });
  }

  closeForm = () => {
    this.close.emit();
    this.unitForm.patchValue({ property: null });
  }


  ngOnInit(): void {
    //this.unitService.clearDeletedImages();
    disableBackgroundScroll();
    this.propertyService.loadProperties();
    const selected = this.unitService.selectedUnit();

    if (selected) {
      this.unitForm.patchValue({
        name: selected.name,
        description: selected.description,
        capacity: selected.capacity,
        price_per_night: selected.price_per_night,
        property: selected.property
      });
    }    
  }

  createUnit() {
    const { property, ...rest } = this.unitForm.value;
    const formData = new FormData();
  
    // Restliche Felder anhängen
    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });
  
    // Property-ID für Backend-Relation
    formData.append('property_id', (property as PropertyShort).id.toString());
  
    // Optional: Property als JSON (damit es ankommt als ganzer Datensatz)
    formData.append('property', JSON.stringify(property));
  
    this.unitService.createUnit(formData, this.images, this.newImageDescriptions);
  }

  updateUnit() { }


  deleteUnit() { }

  ngOnDestroy(): void {
    enableBackgroundScroll();
  }
}
